import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, View } from "react-native";

export default function Splash() {
  const router = useRouter();

  const float = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -12,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");

    setTimeout(() => {
      if (token) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/login");
      }
    }, 2200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ECF2F7", justifyContent: "center", alignItems: "center" }}>
      
      {/* HERO IMAGE */}
      <Animated.Image
        source={require("../assets/images/heroimg.png")}
        style={{
          width: 220,
          height: 220,
          opacity,
          transform: [{ translateY: float }, { scale }],
        }}
        resizeMode="contain"
      />

      {/* LOADING */}
      <View style={{ marginTop: 30 }}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>

    </View>
  );
}