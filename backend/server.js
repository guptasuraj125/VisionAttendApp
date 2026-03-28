import authRoutes from "../routes/auth.js";
import notificationRoutes from "./routes/notificationRoutes.js";
app.use("/api/auth", authRoutes); // ✅ MUST match frontend
app.use("/api/notifications", notificationRoutes);