import dns from 'dns';
import app from './app.js';
import http from "http"
import connectDB from './config/db.js'; 
import config from "./config/env.js"

dns.setServers(['8.8.8.8', '8.8.4.4']);
async function start() {
    await connectDB();

    const server = http.createServer(app);

    server.listen(config.port, () => {
        console.log (`server running on port ${config.port}`)
    })
}
start ();


