import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import expressRateLimit from "express-rate-limit";

export const middleware = (app: Express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors());
    app.use(
        expressRateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        })
    );
};