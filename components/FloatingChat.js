import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function FloatingChat() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/chatbot")}
      style={{
        position: "absolute",
        bottom: 25,
        right: 20,
        backgroundColor: "#007bff",
        padding: 16,
        borderRadius: 50,
        elevation: 6,
      }}
    >
      <Text style={{ color: "white", fontSize: 18 }}>🤖</Text>
    </TouchableOpacity>
  );
}