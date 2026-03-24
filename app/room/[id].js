import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Room() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 20 }}>
        🎥 Live Class
      </Text>

      <Text>Room ID: {id}</Text>
    </View>
  );
}