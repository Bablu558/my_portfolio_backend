import express from "express";
import dotenv from "dotenv";
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
const app = express();

dotenv.config({ path: "./config/config.env" });

app.use(
    cors({

      // origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
      origin: ["http://localhost:5173", "http://localhost:5174","http://localhost:5175", "https://bablu-portfolio-dashboard.netlify.app","https://bablu-kumar.netlify.app"],
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
      createParentPath: true 
    })
  );
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/softwareapplication", softwareApplicationRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/certificate", certificateRouter);
app.use("/api/v1/rating", ratingRouter);
app.use("/api/v1/blog", blogRouter);
dbConnection()
app.use(errorMiddleware);



export default app;