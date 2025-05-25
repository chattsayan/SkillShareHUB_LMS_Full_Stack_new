import { clerkClient } from "@clerk/clerk-sdk-node";

// update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userId = req.auth.userId;
    console.log("Updating role for user:", userId);

    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "educator"
      }
    });

    console.log("User updated successfully:", updatedUser);

    res.json({
      success: true,
      message: "Role updated to educator successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating role to educator:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update role to educator"
    });
  }
};
