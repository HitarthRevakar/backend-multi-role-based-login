//  ----------------- Imports ----------------- //
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./api/auth/auth.routes");
const userRoutes = require("./routes/index.routes");
const tasksRoutes = require("./api/tasks/tasks.routes");

// ----------------- App Setup --------------- //
const app = express();
const PORT = process.env.PORT || 5000;

// ----------------- Middleware ----------------- //
app.use(express.json());
app.use(cors({
    origin: "*"
}));

// ----------------- Routes ----------------- //
app.get("/", (req, res) => {
    res.json({ message: "Backend is live and running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", tasksRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// ----------------- Server Start ----------------- //
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});