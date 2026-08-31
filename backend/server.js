import http from "http";
import app from "./src/app.js";
import { connectDatabase } from "./src/config/database.js";
import { socketGateway } from "./src/infrastructure/websocket/socketGateway.js";
import { ENV } from "./src/config/env.js";

const server = http.createServer(app);

// Initialize Socket.IO Realtime Gateway
socketGateway.initialize(server);

const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(ENV.PORT, () => {
      console.log(`[ProConnect 2.0] Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(`[ProConnect 2.0] API v1 available at http://localhost:${ENV.PORT}/api/v1`);
    });
  } catch (error) {
    console.error("[ProConnect 2.0] Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
