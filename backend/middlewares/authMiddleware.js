import { clerkClient } from "@clerk/clerk-sdk-node";

export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Educator role required.",
      });
    }

    next();
  } catch (error) {
    console.error("Error in protectEducator middleware:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying educator role",
      error: error.message,
    });
  }
};
