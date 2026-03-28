import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { api } from "../services/api";

export default function Layout() {
  useEffect(() => {
    registerForPush();
  }, []);

  const registerForPush = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      console.log("📱 Push Token:", token);

      await api.post("/notifications/save-token", { token });
    } catch (err) {
      console.log("Push error:", err);
    }
  };

  return <Stack screenOptions={{ headerShown: false }} />;
}
