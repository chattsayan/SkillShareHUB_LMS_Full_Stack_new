import express from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import upload from "../utils/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";
import {
  addCourse,
  getEducatorCourses,
  getEducatorDashboardData,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatorController.js";

const educatorRouter = express.Router();

// Add Educator Role - Protected route
educatorRouter.get(
  "/update-role",
  ClerkExpressRequireAuth(),
  updateRoleToEducator
);

// Add new course - Protected route with educator role
educatorRouter.post(
  "/add-course",
  ClerkExpressRequireAuth(), // First verify authentication
  protectEducator, // Then verify educator role
  upload.single("image"), // Then handle file upload
  addCourse
);

educatorRouter.get(
  "/courses",
  ClerkExpressRequireAuth(),
  protectEducator,
  getEducatorCourses
);

educatorRouter.get(
  "/dashboard",
  ClerkExpressRequireAuth(),
  protectEducator,
  getEducatorDashboardData
);

educatorRouter.get(
  "/enrolled-students",
  ClerkExpressRequireAuth(),
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
