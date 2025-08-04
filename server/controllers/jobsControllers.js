import supabase from '../connection/databaseConnection.js'

export async function getJobs(req, res) {
  try {
    // Get all jobs from Supabase with ordering for better performance
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('date_applied', { ascending: false })

    // handling database errors from scrim 
    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch jobs', 
        details: error.message
      })
    }

    // sending successful response
    res.json(jobs)

  } catch (err) {
    // handling unexpected errors srim 
    res.status(500).json({
      error: 'Failed to fetch jobs', 
      details: err.message
    })
  }
}

// reads with filterations 
export async function getJobsByStatus(req, res) {
  try {
// extracting query parameters 
    const { status } = req.query
// building dynamic query
    let query = supabase.from('jobs').select('*') // base quey 
    // more conditional filtering
    if (status) {
      query = query.eq('status', status)
    }
    
    // add ordering for consistent results
    query = query.order('date_applied', { ascending: false })

    // query execution awaiting the data
    const { data: jobs, error } = await query

    // handle db errors 
    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch jobs', 
        details: error.message
      })
    }

    // sendign successful response 
    res.json(jobs)

  } catch (err) {
    // handling unexpected errors 
    res.status(500).json({
      error: 'Failed to fetch jobs', 
      details: err.message
    })
  }
}

//search operation optimized for combined search and status filtering
export async function searchJobs(req, res) {

  try {
    // extract search parameters
    const { search, status } = req.query

    // if no search term and no status, return all jobs
    if (!search && !status) {
      return getJobs(req, res)
    }

    // build dynamic query starting with base
    let query = supabase.from('jobs').select('*')

    // add search filtering if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%, company.ilike.%${search}%, notes.ilike.%${search}%`)
    }

    // add status filtering if provided
    if (status) {
      query = query.eq('status', status)
    }

    // add ordering for consistent results and better performance
    query = query.order('date_applied', { ascending: false })

    // execute the combined query
    const { data: jobs, error } = await query

    // handle db errors
    if (error) {
      return res.status(500).json({
        error: 'Failed to search jobs', 
        details: error.message
      })
    }

    // sending successful response
    res.json(jobs)

  } catch (err) {
    // handle unexpected errors
    res.status(500).json({
      error: 'Failed to search jobs', 
      details: err.message
    })
  }
}

// create operation
export async function createJob(req, res) {

  try {

    // extract data from request body (POST data comes in req.body)
    // is different from GET requests where data comes from req.query
    const { company, title, status, date_applied, notes } = req.body

    // required fields validaiton for the job
    if (!company || !title) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Company and title are required'
      })
    }

    // Prepare data with defaults (like your learning pattern with defaults)
    // SQL equivalent: INSERT INTO jobs (company, title, status, date_applied, notes)
    //                 VALUES (?, ?, ?, ?, ?)
    // Supabase equivalent: .insert([{ company, title, status, date_applied, notes }])
    
    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert([{ // array because you can insert multiple
        company,
        title,
        status: status || 'applied', // default to applied if not provided
        date_applied: date_applied || new Date().toISOString().split('T')[0], // Default to today
        notes: notes || ''
      }])
      .select()                    // return the created record (like RETURNING * in SQL)

    if (error) {
      return res.status(500).json({
        error: 'Failed to create job',
        details: error.message
      })
    }

    // created response
    res.status(201).json({
      message: 'Job created successfully',
      job: newJob[0]             
    })

  } catch (err) {
    // Step 6: Handle unexpected errors (same pattern)
    res.status(500).json({
      error: 'Failed to create job',
      details: err.message
    })
  }
}

// reading by id 
export async function getJobById(req, res) {

  try {

    // id from URL parameters
    // URL: /api/jobs/here
    const { id } = req.params

    // query for specific record 
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single() // get single record

    // handle annoying specific error
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Job not found',
          details: `No job found with ID: ${id}`
        })
      }
      return res.status(500).json({
        error: 'Failed to fetch job',
        details: error.message
      })
    }

    res.json(job)

  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch job',
      details: err.message
    })
  }
}

// update operation
export async function updateJob(req, res) {

  try {
    // get id from url 
    const { id } = req.params
    const { company, title, status, date_applied, notes } = req.body

    // build update object by partial updates 
    const updateData = {}
    if (company !== undefined) updateData.company = company
    if (title !== undefined) updateData.title = title
    if (status !== undefined) updateData.status = status
    if (date_applied !== undefined) updateData.date_applied = date_applied
    if (notes !== undefined) updateData.notes = notes

    // is there anything to update?????
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data provided',
        details: 'At least one field must be provided to update'
      })
    }

    // update job in db
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select() // Return the updated job

    if (error) {
      return res.status(500).json({
        error: 'Failed to update job',
        details: error.message
      })
    }

    // found and updated the record?
    if (!updatedJob || updatedJob.length === 0) {
      return res.status(404).json({
        error: 'Job not found',
        details: `No job found with ID: ${id}`
      })
    }

    res.json({
      message: 'Job updated successfully',
      job: updatedJob[0]        // return the updated job
    })

  } catch (err) {
    res.status(500).json({
      error: 'Failed to update job',
      details: err.message
    })
  }
}

// delete operation
export async function deleteJob(req, res) {

  try {
    // get id from URL: DELETE /api/jobs/here 
    const { id } = req.params

    // delete from db 
    const { data: deletedJob, error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .select() // return the deleted job

    if (error) {
      return res.status(500).json({
        error: 'Failed to delete job',
        details: error.message
      })
    }

    // if record was found and deleted
    // if no record matched the ID, deletedJob will be empty array
    if (!deletedJob || deletedJob.length === 0) {
      return res.status(404).json({
        error: 'Job not found',
        details: `No job found with ID: ${id}`
      })
    }

    res.json({
      message: 'Job deleted successfully',
      deletedJob: deletedJob[0]     // show what was deleted
    })

  } catch (err) {
    res.status(500).json({
      error: 'Failed to delete job',
      details: err.message
    })
  }
}