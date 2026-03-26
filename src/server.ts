import dotenv from "dotenv";

dotenv.config({
  path: "./src/environment/.env"
});

import { createServer } from "http";
import connectDB from "./app/cors/mongodb/db.js";
import app from "../src/app.js";
import { initSocket } from "./app/cors/socket/socket.js";

// 1️⃣ Connect to database
connectDB();

// 2️⃣ Create HTTP server using Express app
const httpServer = createServer(app);

// 3️⃣ Initialize Socket.IO (safe, idempotent)
initSocket(httpServer);

// 4️⃣ Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
