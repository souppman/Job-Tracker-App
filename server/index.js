import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // loads env vars so i dont hardcode this shit

dotenv.config();

//intilize the express app
const app = express();
const PORT = process.env.PORT || 3000; // || just in case var is fucking up

//middleware
app.use(cors()); // to accept requests from other ports
app.use(express.json()); // parse json bodies so it can be human readable access via req.body

// route starter
app.get('/', (req, res) => { // route to respond to gets only 
    res.json({ message: 'JT API is runnin' }); // sending js ->jsonto client to get validation 
}); // content type is json to app/json auto set by express

// Other API routes will be going here
app.get('/api/jobs', (req, res)=> {
    res.json({ message: 'jobs endpoint???' });
}) ;

// start the server
app.listen(PORT,() => { // listen for requests on port 3000
    console.log('server running on http://localhost:${PORT}');
});