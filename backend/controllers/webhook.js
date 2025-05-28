import { Webhook } from "svix";
import User from "../models/User.js";
import "dotenv/config";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const clerkWebhooks = async (req, res) => {
  try {
    const webHook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await webHook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const stripeWebhooks = async (request, response) => {
  try {
    const sig = request.headers["stripe-signature"];
    console.log("Received webhook with signature:", sig);

    if (!sig) {
      console.error("No stripe-signature header found");
      return response.status(400).json({ error: "No stripe-signature header" });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return response.status(500).json({ error: "Webhook secret not configured" });
    }

    let event;
    try {
      console.log("Attempting to construct event with webhook secret");
      event = stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Successfully constructed event:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", {
        error: err.message,
        signature: sig
      });
      return response.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        console.log("Processing successful payment:", {
          paymentIntentId,
          amount: paymentIntent.amount,
          status: paymentIntent.status
        });

        try {
          const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          console.log("Found session:", {
            sessionId: session.data[0]?.id,
            metadata: session.data[0]?.metadata
          });

          if (!session.data.length) {
            console.error("No session found for payment intent:", paymentIntentId);
            return response.status(400).json({ error: "No session found" });
          }

          const { purchaseId } = session.data[0].metadata;
          if (!purchaseId) {
            console.error("No purchaseId in session metadata");
            return response.status(400).json({ error: "No purchaseId in metadata" });
          }

          console.log("Found purchase ID:", purchaseId);

          const purchaseData = await Purchase.findById(purchaseId);
          if (!purchaseData) {
            console.error("Purchase not found:", purchaseId);
            return response.status(400).json({ error: "Purchase not found" });
          }

          console.log("Found purchase data:", {
            purchaseId: purchaseData._id,
            status: purchaseData.status,
            amount: purchaseData.amount
          });

          const userData = await User.findById(purchaseData.userId);
          if (!userData) {
            console.error("User not found:", purchaseData.userId);
            return response.status(400).json({ error: "User not found" });
          }

          const courseData = await Course.findById(purchaseData.courseId.toString());
          if (!courseData) {
            console.error("Course not found:", purchaseData.courseId);
            return response.status(400).json({ error: "Course not found" });
          }

          // Update course enrollment
          if (!courseData.enrolledStudents.includes(userData._id)) {
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
            console.log("Updated course enrollments:", {
              courseId: courseData._id,
              studentId: userData._id
            });
          }

          // Update user's enrolled courses
          if (!userData.enrolledCourses.includes(courseData._id)) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
            console.log("Updated user enrollments:", {
              userId: userData._id,
              courseId: courseData._id
            });
          }

          // Update purchase status
          purchaseData.status = "completed";
          await purchaseData.save();
          console.log("Updated purchase status to completed:", {
            purchaseId: purchaseData._id,
            newStatus: purchaseData.status
          });

          return response.json({ received: true });
        } catch (error) {
          console.error("Error processing payment_intent.succeeded:", {
            error: error.message,
            stack: error.stack,
            paymentIntentId
          });
          return response.status(500).json({ error: "Error processing payment" });
        }
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        console.log("Processing failed payment:", paymentIntentId);

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data.length) {
          console.error("No session found for payment intent:", paymentIntentId);
          return response.status(400).json({ error: "No session found" });
        }

        const { purchaseId } = session.data[0].metadata;
        const purchaseData = await Purchase.findById(purchaseId);
        
        if (purchaseData) {
          purchaseData.status = "failed";
          await purchaseData.save();
          console.log("Updated purchase status to failed");
        }

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        return response.json({ received: true });
    }
  } catch (error) {
    console.error("Error in webhook handler:", {
      error: error.message,
      stack: error.stack
    });
    return response.status(500).json({ error: "Internal server error" });
  }
};
