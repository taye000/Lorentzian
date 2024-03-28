import express, { Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import logger from "../utils/logger";

export const middleware = (app: Express) => {
  // Request logging middleware
  app.use(morgan("dev"));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors());
  app.use(bodyParser.json());

  // Rate limiting middleware
  app.use(
    expressRateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );

  // Security headers middleware
  app.use(helmet());

  // Compression middleware
  app.use(compression());

  // Custom error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error("Error occurred:", err);
    res.status(500).json({ error: "Internal server error" });
  });
};
