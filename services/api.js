import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "https://visionattend-backend.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ✅ AUTO TOKEN
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("👉 API:", config.url);
  return config;
});

// ✅ HANDLE TOKEN EXPIRE
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.data?.message === "Invalid or expired token") {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);