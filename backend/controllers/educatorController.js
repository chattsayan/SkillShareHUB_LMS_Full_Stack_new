import { clerkClient } from "@clerk/clerk-sdk-node";
import { v2 as cloudinary } from "cloudinary";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

// update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.auth.userId;

    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({
      success: true,
      message: "Role updated to educator successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating role to educator:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update role to educator",
    });
  }
};

// Add new course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail not attached",
      });
    }

    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    const newCourse = await Course.create(parsedCourseData);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add course",
    });
  }
};

// get educator courses
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });

    res.status(201).json({
      success: true,
      message: "Educator courses fetched successfully",
      courses,
    });
  } catch (error) {
    console.error("Error fetching educator courses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch educator courses",
    });
  }
};

// get educator dashboard data
export const getEducatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map((course) => course._id);

    // calculate total earnings
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );

    // collect unique enrolled id with course title
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );

      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.status(200).json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    console.error("Error fetching educator dashboard data:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch educator dashboard data",
    });
  }
};

// get enrolled students data with purchase date
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.status(200).json({
      success: true,
      enrolledStudents,
    });
  } catch (error) {
    console.error("Error fetching enrolled students data:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch enrolled students data",
    });
  }
};
