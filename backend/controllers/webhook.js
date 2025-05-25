import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const webHook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await webHook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      imageUrl: data.image_url,
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        res.JSON({});
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        res.JSON({});
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        res.JSON({});
        break;
      default:
        console.warn("Unhandled event type:", type);
        res.status(400).json({ message: "Unhandled event type" });
    }
  } catch (error) {
    console.error("Error in clerkWebhooks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
