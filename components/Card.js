import { View } from "react-native";

export default function Card({ children }) {
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: "white",
        borderRadius: 14,
        marginBottom: 12,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}