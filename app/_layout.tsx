import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { api } from "../services/api";

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      registerForPush();
    }
  }, []);

  const registerForPush = async () => {
    try {
      // 🚫 Disable notifications in Expo Go
      if (__DEV__) {
        console.log("⚠️ Push notifications disabled in Expo Go");
        return;
      }

      const Notifications = await import("expo-notifications");

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
