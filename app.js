import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import dbConnection from "./database/dbconnection.js";
import { errorMiddleware } from "./middleware/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import timelineRouter from "./router/timelineRouter.js";
import softwareApplicationRouter from "./router/softwareApplicationRouter.js";
import skillRouter from "./router/skillRouter.js";
import projectRouter from "./router/projectRouter.js";
import certificateRouter from "./router/certificateRouter.js";
import ratingRouter from "./router/ratingRouter.js";
import blogRouter from "./router/blogRoute.js";
import blogUserRouter from "./router/blogUserRouter.js";
import sitemapRouter from "./router/sitemapRouter.js";

const app = express();

// Environment setup
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env only locally (Render already has environment vars)
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: join(__dirname, "config", "config.env") });
  console.log(" Local Mode: .env loaded");
} else {
  console.log("Render Mode: Using Render environment variables");
}
 
// console.log("Loaded Mongo URL:", process.env.MONGO_URL);

// 🔥 Connect Database
dbConnection();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://bablu-portfolio-dashboard.netlify.app",
      "https://bablu-kumar.netlify.app",
      "https://bablukumar.online",
      "https://www.bablukumar.online",
      "https://admin.bablukumar.online",
      "https://blogs.bablukumar.online",
      "https://www.blogs.bablukumar.online",

      "https://tech-blogs-by-bablu-kumar.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

// Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/softwareapplication", softwareApplicationRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/certificate", certificateRouter);
app.use("/api/v1/rating", ratingRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/blog-user", blogUserRouter);
app.use("/", sitemapRouter);

//  Status Page
app.get("/", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    const isHealthy = dbStatus === "connected";
    const currentTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Portfolio Backend Status</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen flex flex-col items-center justify-center font-[Poppins] bg-gradient-to-br from-slate-900 to-slate-950 text-white relative overflow-hidden">
      <button id="themeToggle" class="absolute top-5 right-5 border border-gray-500 rounded-md px-3 py-1 text-sm hover:bg-gray-700 transition">🌙</button>
      <div class="text-4xl animate-bounce mb-4">🚀</div>
      <h1 class="text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-orange-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
        Portfolio Backend
      </h1>
      <div class="flex items-center gap-3 mt-4 text-xl font-semibold">
        <div class="w-4 h-4 rounded-full ${
          isHealthy ? "bg-green-500 animate-ping" : "bg-red-500 animate-pulse"
        }"></div>
        <span class="${isHealthy ? "text-green-400" : "text-red-400"}">
          ${isHealthy ? "Running Smoothly" : "Server Issue Detected"}
        </span>
      </div>
      <p class="mt-2 text-lg ${isHealthy ? "text-green-400" : "text-red-400"}">
        <strong>Database:</strong> ${dbStatus}
      </p>
      <p class="mt-1 text-sm text-purple-400">
        <strong>Last Checked:</strong> ${currentTime}
      </p>
      <div class="absolute bottom-4 text-gray-500 text-sm">
        💻 Developed by <b class="text-blue-400">Bablu Kumar</b>
      </div>
      <script>
        const body=document.body;const btn=document.getElementById('themeToggle');const hour=new Date().getHours();
        const setLight=()=>{body.classList.remove('from-slate-900','to-slate-950','text-white');body.classList.add('from-blue-100','to-sky-200','text-gray-800');btn.textContent="☀️";};
        const setDark=()=>{body.classList.remove('from-blue-100','to-sky-200','text-gray-800');body.classList.add('from-slate-900','to-slate-950','text-white');btn.textContent="🌙";};
        if(hour>=6&&hour<18)setLight();else setDark();
        btn.addEventListener('click',()=>{if(body.classList.contains('text-white'))setLight();else setDark();});
      </script>
    </body>
    </html>`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res.status(500).send(`<h2 style="color:red;text-align:center">❌ Server Error: ${error.message}</h2>`);
  }
});

app.use(errorMiddleware);
export default app;
