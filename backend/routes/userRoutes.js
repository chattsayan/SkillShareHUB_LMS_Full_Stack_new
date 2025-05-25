import express from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import {
  getUserData,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Protected routes
userRouter.get("/data", ClerkExpressRequireAuth(), getUserData);
userRouter.get("/enrolled-courses", userEnrolledCourses);

export default userRouter;
