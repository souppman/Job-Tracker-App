import 'dotenv/config'; // loads env vars immediately on import for ES modules
import express from 'express';
import cors from 'cors';
import { jobsRouter } from './routes/jobsRoutes.js';

//intilize the express app
const app = express();
const PORT = process.env.PORT || 3000; // || just in case var is fucking up

//middleware
app.use(cors()); // to accept requests from other ports
app.use(express.json()); // parse json bodies so it can be human readable access via req.body

// routes
// this is the health check route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Job Tracker API is running!',
        version: '1.0.0',
        endpoints: {
            jobs: '/api/jobs',
            search: '/api/jobs/search',
            filter: '/api/jobs/status'
        }
    });
});

// mount job routes
app.use('/api/jobs', jobsRouter);

// Removed test route for security - no need to expose database connection testing in production

// start the server
app.listen(PORT,() => { // listen for requests on port 3000 - no callback needed
    console.log(`server running on http://localhost:${PORT}`);
});
