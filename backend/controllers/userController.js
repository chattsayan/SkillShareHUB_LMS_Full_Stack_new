import User from "../models/User.js";

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
