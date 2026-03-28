import fetch from "node-fetch";

let pushTokens = [];

export const saveToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    if (!pushTokens.includes(token)) {
      pushTokens.push(token);
    }

    console.log("📱 Tokens:", pushTokens);

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

export const sendPushNotification = async (title, body) => {
  try {
    if (pushTokens.length === 0) return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        pushTokens.map((token) => ({
          to: token,
          title,
          body,
          sound: "default",
        }))
      ),
    });

    console.log("🔔 Notification sent");
  } catch (err) {
    console.log("Push error:", err);
  }
};