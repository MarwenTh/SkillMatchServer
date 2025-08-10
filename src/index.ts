import express, { Express, Request, Response } from "express";
import cors from "cors";
import mailRouter from "./routes/mail.route";
import { testConnection, initializeDatabase } from "./lib/database";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", mailRouter);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "SkillMatch Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(
        `📱 Health check available at http://localhost:${PORT}/health`
      );
      console.log(`🗄️  Database connected and initialized`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
