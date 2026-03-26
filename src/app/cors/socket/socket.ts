import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

/**
 * Socket.IO instance (lazy initialized)
 */
let io: Server | null = null;

/**
 * Initialize Socket.IO ONCE
 */
export const initSocket = (httpServer: HttpServer): Server => {
  if (io) {
    console.log("ℹ️ Socket.IO already initialized");
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const auth = socket.handshake.auth ?? {};

    const userId = auth.userId ? String(auth.userId) : null;
    const name = auth.name ?? null;

    // ✅ SAFE ROLE RESOLUTION
    const role =
      typeof auth.role === "string"
        ? auth.role
        : auth.role?.displayName ?? null;

    console.log(`
🔌 Socket connected
Socket ID : ${socket.id}
User ID   : ${userId ?? "N/A"}
Name      : ${name ?? "N/A"}
Role      : ${role ?? "N/A"}
`);

    // Join user-specific room
    if (userId) {
      socket.join(userId);
    }

    socket.on("disconnect", (reason) => {
      console.log(`
❌ Socket disconnected
Socket ID : ${socket.id}
User ID   : ${userId ?? "N/A"}
Name      : ${name ?? "N/A"}
Role      : ${role ?? "N/A"}
Reason    : ${reason}
`);
    });
  });

  console.log("✅ Socket.IO initialized");

  return io;
};

/*Get Socket.IO instance safely*/
export const getIO = (): Server | null => {
  if (!io) {
    console.warn("⚠️ Socket.IO not initialized yet");
    return null;
  }
  return io;
};
