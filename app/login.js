import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { api } from "../services/api";

const { width, height } = Dimensions.get("window");

// 🎨 Colors
const C = {
  bg: "#FFFFFF",
  white: "#FFFFFF",
  black: "#000000",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B6B6B",
};

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎬 Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 🔥 LOGIN FUNCTION (FIXED)
  const login = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Enter email & password");
    }

    try {
      setLoading(true);

      const payload = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: "student", // ⚠️ change if backend expects different
      };

      console.log("👉 LOGIN PAYLOAD:", payload);

      const res = await api.post("/auth/login", payload);

      console.log("✅ RESPONSE:", res.data);

      const token =
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.accessToken;

      if (!token) {
        Alert.alert("Login Failed", "Token not received");
        return;
      }

      await AsyncStorage.setItem("token", token);

      router.replace("/(tabs)/dashboard");

    } catch (err) {
      console.log("❌ ERROR:", err.response?.data || err.message);

      Alert.alert(
        "Login Failed",
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          }}
        >
          {/* 🔥 HERO IMAGE */}
          <View style={{ height: height * 0.38 }}>
            <Image
              source={require("../assets/images/heroimg.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>

          {/* 🔥 FORM */}
          <View
            style={{
              flex: 1,
              backgroundColor: C.white,
              marginTop: -30,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 40,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: "900", color: C.black }}>
              Vision Attendance
            </Text>

            <Text style={{ fontSize: 13, color: C.gray500, marginBottom: 28 }}>
              AI-powered biometric academic system
            </Text>

            {/* Email */}
            <View style={{ marginBottom: 18 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: C.gray200,
                  borderRadius: 14,
                  backgroundColor: C.gray100,
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={C.gray400}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  style={{ paddingVertical: 14 }}
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: C.gray200,
                  borderRadius: 14,
                  backgroundColor: C.gray100,
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={C.gray400}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={{ paddingVertical: 14 }}
                />
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={login}
              disabled={loading}
              style={{
                backgroundColor: C.black,
                paddingVertical: 16,
                borderRadius: 30,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={{ color: C.white, fontWeight: "700" }}>
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}