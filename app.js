// app.js
require("dotenv").config();

const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { authenticate } = require("./middleware/auth");

const connectDB = require("./db/index");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
};

connectDB();

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: "application/vnd.api+json", strict: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const userRouter = require("./routes/userRoutes");

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("Hello World!");
});

app.use("/api/v1/users", userRouter);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("message", (data) => {
    console.log(`Message received: ${data}`);
    socket.emit("messageResponse", `Server received your message: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.DOMAIN || "localhost"}:${PORT}`
  );
});
