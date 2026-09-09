import dns from 'dns';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import config from './config/env.js';
import { initSocket } from './config/socket.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function start() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
}

start();