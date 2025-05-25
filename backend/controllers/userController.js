import Stripe from "stripe";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import CourseProgress from "../models/courseProgress.js";

// get user data
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch User Data",
    });
  }
};

// user enrolled courses with lectures link
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId).populate("enrolledCourses");

    res
      .status(200)
      .json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error("Error fetching users enrolled courses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users enrolled courses",
    });
  }
};

// Purchase
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.status(404).json({
        success: false,
        message: "User or Course not found",
      });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    // stripe gateway integration
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toUpperCase();

    //   creating line items for the stripe
    const lineItems = [
      {
        price_data: {
          currency,
          product_data: { name: courseData.courseTitle },
          unit_amount: Math.floor(newPurchase.amount) * 100, // amount in cents
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: lineItems,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.status(200).json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Error purchasing course:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to purchase course",
    });
  }
};

// update User course progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;
    const progressData = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.status(400).json({
          success: false,
          message: "Lecture already completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.status(200).json({
      success: true,
      message: "Course progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating course progress:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update course progress",
    });
  }
};

// get user course progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.status(200).json({
      success: true,
      message: "Course progress fetched successfully",
      progressData,
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch course progress",
    });
  }
};

// add user rating function
export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;

  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid rating data" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(404).json({
        success: false,
        message: "User has not purchased this course",
      });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "User rating added successfully",
    });
  } catch (error) {
    console.error("Error adding user rating:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add user rating",
    });
  }
};
