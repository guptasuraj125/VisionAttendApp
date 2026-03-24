import express from "express";
const router = express.Router();

// 🔐 Dummy middleware (replace with your real auth middleware)
const authMiddleware = (req, res, next) => {
  // Example: user injected from token
  req.user = {
    _id: "123",
    name: "Suraj",
    batchKey: "69b1a594c41e7a76c4775d7b_TY_A",
  };
  next();
};

// ✅ FINAL /me route
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;