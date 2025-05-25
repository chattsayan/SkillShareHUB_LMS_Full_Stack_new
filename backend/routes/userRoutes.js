import express from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import {
  addUserRating,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Protected routes
userRouter.get("/data", ClerkExpressRequireAuth(), getUserData);
userRouter.get("/enrolled-courses", ClerkExpressRequireAuth(), userEnrolledCourses);
userRouter.post("/purchase", ClerkExpressRequireAuth(), purchaseCourse);

// Course progress and rating routes
userRouter.post("/update-course-progress", ClerkExpressRequireAuth(), updateUserCourseProgress);
userRouter.get("/course-progress/:courseId", ClerkExpressRequireAuth(), getUserCourseProgress);
userRouter.post("/add-rating", ClerkExpressRequireAuth(), addUserRating);

export default userRouter;
