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
userRouter.get("/enrolled-courses", userEnrolledCourses);
userRouter.post("/purchase", ClerkExpressRequireAuth(), purchaseCourse);

userRouter.post("/update-course-progress", updateUserCourseProgress);
userRouter.post("/get-course-progress", getUserCourseProgress);
userRouter.post("/add-rating", addUserRating);

export default userRouter;
