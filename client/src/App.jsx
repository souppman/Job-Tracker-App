import { useState, useEffect } from 'react'
import { jobsApi } from './services/jobsApi'
import JobForm from './components/JobForm'

function App() {
  const [jobs, setJobs] = useState([])
  const [allJobs, setAllJobs] = useState([]) // Store all jobs for stats
  const [recentJobs, setRecentJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatusFilter, setActiveStatusFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch jobs with search and status filtering (optimized)
  const fetchJobs = async (search = '', status = '', isSearch = false) => {
    try {
      // Use separate loading state for search to avoid disrupting the main UI
      if (isSearch) {
        setSearchLoading(true)
      } else {
        setLoading(true)
      }
      
      let jobsData
      
      // Use optimized search endpoint that handles both search and status in one query
      if (search.trim() || status) {
        jobsData = await jobsApi.searchJobs(search.trim(), status)
      } else {
        jobsData = await jobsApi.getAllJobs()
      }
      
      setJobs(jobsData)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching jobs:', err)
    } finally {
      if (isSearch) {
        setSearchLoading(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch all jobs for stats and recent
  const fetchAllJobsData = async () => {
    try {
      const allJobsData = await jobsApi.getAllJobs()
      setAllJobs(allJobsData)
      
      // Get recent jobs (most recent 6)
      const sortedJobs = allJobsData.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied))
      setRecentJobs(sortedJobs.slice(0, 6))
    } catch (err) {
      console.error('Error fetching all jobs data:', err)
    }
  }

  // Calculate status counts
  const getStatusCounts = () => {
    const counts = {
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0
    }
    
    allJobs.forEach(job => {
      if (counts.hasOwnProperty(job.status)) {
        counts[job.status]++
      }
    })
    
    return counts
  }

  // Handle status filter
  const handleStatusFilter = (status) => {
    const newStatus = activeStatusFilter === status ? '' : status
    setActiveStatusFilter(newStatus)
    fetchJobs(searchTerm, newStatus)
  }

  // Load initial data
  useEffect(() => {
    fetchJobs()
    fetchAllJobsData()
  }, [])

  // Handle search with debouncing - optimized to not refetch stats
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(searchTerm, activeStatusFilter, true) // Mark as search operation
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle delete job
  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobsApi.deleteJob(jobId)
        // Refresh data - only fetch all jobs data if needed for stats
        fetchJobs(searchTerm, activeStatusFilter)
        if (!searchTerm && !activeStatusFilter) {
          // Only refresh all jobs data if we're viewing the full list
          fetchAllJobsData()
        }
      } catch (err) {
        setError('Failed to delete job application')
      }
    }
  }

  // Handle edit job
  const handleEditJob = (job) => {
    setEditingJob(job)
    setShowAddForm(true)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-6 border-b border-gray-800">
        <div className="relative flex justify-end items-center">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold">Job Tracker</h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            + Add New Application
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        {/* Stats Dashboard */}
        {!loading && !error && allJobs.length > 0 && (
          <div className="mb-8">
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { status: 'applied', label: 'Applied', color: 'text-blue-400' },
                { status: 'interviewing', label: 'Interview', color: 'text-yellow-400' },
                { status: 'offer', label: 'Offers', color: 'text-green-400' },
                { status: 'rejected', label: 'Rejected', color: 'text-red-400' }
              ].map(({ status, label, color }) => {
                const counts = getStatusCounts()
                const isActive = activeStatusFilter === status
                return (
                  <div
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`bg-zinc-900 border rounded-lg p-4 cursor-pointer transition-all hover:border-gray-600 ${
                      isActive ? 'border-blue-500 bg-zinc-800' : 'border-zinc-800'
                    }`}
                  >
                    <div className={`text-2xl font-bold ${color} mb-1`}>
                      {counts[status]}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Search Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search companies or positions..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full bg-black border border-gray-700 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Filter Dropdown Button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-4 py-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </button>
                  
                  {/* Status Filter Dropdown */}
                  {showStatusDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-10">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setActiveStatusFilter('')
                            fetchJobs(searchTerm, '')
                            setShowStatusDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-zinc-800 transition-colors"
                        >
                          All Statuses
                        </button>
                        {[
                          { status: 'applied', label: 'Applied' },
                          { status: 'interviewing', label: 'Interview' },
                          { status: 'offer', label: 'Offers' },
                          { status: 'rejected', label: 'Rejected' }
                        ].map(({ status, label }) => (
                          <button
                            key={status}
                            onClick={() => {
                              handleStatusFilter(status)
                              setShowStatusDropdown(false)
                            }}
                            className={`w-full text-left px-4 py-2 transition-colors ${
                              activeStatusFilter === status 
                                ? 'bg-blue-900 text-blue-200' 
                                : 'text-gray-300 hover:bg-zinc-800'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Active Filters Display */}
              {activeStatusFilter && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-400">Filtered by:</span>
                  <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {activeStatusFilter.charAt(0).toUpperCase() + activeStatusFilter.slice(1)}
                    <button
                      onClick={() => handleStatusFilter(activeStatusFilter)}
                      className="hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Job Form Modal */}
        {showAddForm && (
          <JobForm 
            job={editingJob}
            onClose={() => {
              setShowAddForm(false)
              setEditingJob(null)
            }}
            onSuccess={() => {
              setShowAddForm(false)
              setEditingJob(null)
              fetchJobs(searchTerm, activeStatusFilter)
              // Always refresh stats when adding/editing jobs
              fetchAllJobsData()
            }}
          />
        )}

        {/* All Applications Section - Moved to Top */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">All Applications</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-2">Loading jobs...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-100 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
              <p className="text-sm mt-1">Make sure your backend server is running on port 3000</p>
            </div>
          )}

          {/* Jobs Table */}
          {!loading && !error && (
            <div>
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No jobs found. Start by adding your first job application!</p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-zinc-800 border-b border-zinc-700">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-300">
                      <div className="col-span-2">Company</div>
                      <div className="col-span-2">Position</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">Date Applied</div>
                      <div className="col-span-3">Notes</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-zinc-800">
                    {jobs.map((job) => (
                      <div key={job.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-800 transition-colors">
                        {/* Company */}
                        <div className="col-span-2">
                          <div className="font-medium text-white">{job.company}</div>
                        </div>
                        
                        {/* Position */}
                        <div className="col-span-2">
                          <div className="text-gray-300">{job.title}</div>
                        </div>
                        
                        {/* Status */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'applied' ? 'bg-blue-900 text-blue-200' :
                            job.status === 'interviewing' ? 'bg-yellow-900 text-yellow-200' :
                            job.status === 'offer' ? 'bg-green-900 text-green-200' :
                            'bg-red-900 text-red-200'
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                        
                        {/* Date Applied */}
                        <div className="col-span-2">
                          <div className="text-gray-300 text-sm">
                            {new Date(job.date_applied).toLocaleDateString('en-US', { 
                              month: 'numeric', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                        
                        {/* Notes */}
                        <div className="col-span-3">
                          <div className="text-gray-400 text-sm truncate">
                            {job.notes || 'No notes'}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditJob(job)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Applications Section */}
        {!loading && !error && recentJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Recent Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recentJobs.map((job) => (
                <div key={job.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                  {/* Company Name as main title */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{job.company}</h3>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'applied' ? 'bg-blue-900 text-blue-200' :
                        job.status === 'interviewing' ? 'bg-yellow-900 text-yellow-200' :
                        job.status === 'offer' ? 'bg-green-900 text-green-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Job Title */}
                  <p className="text-gray-300 font-medium mb-4">{job.title}</p>
                  
                  {/* Date Applied */}
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(job.date_applied).toLocaleDateString('en-US', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  
                  {/* Notes/Description */}
                  {job.notes && (
                    <p className="text-gray-400 text-sm mt-4 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {job.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App 