import express from 'express'
import { 
  getJobs, 
  getJobsByStatus, 
  searchJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobById
} from '../controllers/jobsControllers.js'

export const jobsRouter = express.Router()

// read routes
// GET all jobs
jobsRouter.get('/', getJobs)

// GET /api/jobs/search?search=developer search jobs by title, company, description
jobsRouter.get('/search', searchJobs)

// GET /api/jobs/status?status=applied 
jobsRouter.get('/status', getJobsByStatus)

// GET /api/jobs/:id 
jobsRouter.get('/:id', getJobById)

// create route
// POST /api/jobs 
jobsRouter.post('/', createJob)

// update route
// PUT /api/jobs/:id 
jobsRouter.put('/:id', updateJob)

// delete route
// DELETE /api/jobs/:id 
jobsRouter.delete('/:id', deleteJob)