import { Webhook } from "svix";
import User from "../models/User.js";
import "dotenv/config";

export const clerkWebhooks = async (req, res) => {
  console.log("=== WEBHOOK ENDPOINT HIT ===");
  console.log("Request received at:", new Date().toISOString());

  try {
    console.log("Webhook received:", {
      headers: req.headers,
      body: req.body
    });

    const webHook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await webHook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;
    console.log("Webhook type:", type);
    console.log("User data:", data);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      imageUrl: data.image_url,
    };

    console.log("Processed user data:", userData);

    switch (type) {
      case "user.created":
        console.log("Creating new user...");
        const newUser = await User.create(userData);
        console.log("User created:", newUser);
        res.json({ message: "User created successfully", user: newUser });
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        res.json({ message: "User updated successfully" });
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        res.json({ message: "User deleted successfully" });
        break;
      default:
        console.warn("Unhandled event type:", type);
        res.status(400).json({ message: "Unhandled event type" });
    }
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
