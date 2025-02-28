require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const securityMiddleware = require("./middleware/security");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const favoritesRoutes = require("./routes/favorites");
const orderRoutes = require("./routes/order");
const menuRoutes = require("./routes/menu");
const adminRoutes = require("./routes/admin"); // Added admin routes

const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    //  origin: process.env.CORS_ORIGIN || '*',
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  // origin: process.env.CORS_ORIGIN || '*', // Allow specific domain or all
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
securityMiddleware(app);

// Store connected admin clients
const connectedAdmins = new Set();

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("admin-connect", () => {
    console.log("Admin connected:", socket.id);
    connectedAdmins.add(socket.id);
  });
  socket.on("client-connected", () => {
    console.log("Client connected:", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    connectedAdmins.delete(socket.id);
  });
});

// Emit order updates to admins
const sendOrderUpdateToAdmins = (order) => {
  connectedAdmins.forEach((adminSocket) => {
    io.to(adminSocket).emit("order-update", order);
  });
};

// Database connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to MongoDB:", err);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/admin", adminRoutes); // Admin route

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io, sendOrderUpdateToAdmins };
