import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../services/api";

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);

  if (!permission?.granted) {
    return (
      <TouchableOpacity onPress={requestPermission}>
        <Text>Grant Camera Permission</Text>
      </TouchableOpacity>
    );
  }

  const scan = async () => {
    const photo = await cameraRef.takePictureAsync({ base64: true });

    try {
      const res = await api.post("/attendance/scan-face-class", {
        image: photo.base64,
      });

      if (!res.data.success) return Alert.alert("Face not matched");

      await api.post("/attendance/mark-class");

      Alert.alert("✅ Attendance Marked");
    } catch {
      Alert.alert("Error");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} ref={setCameraRef} facing="front" />

      <TouchableOpacity
        onPress={scan}
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
          backgroundColor: "#007bff",
          padding: 15,
          borderRadius: 50,
        }}
      >
        <Text style={{ color: "white" }}>Scan Face</Text>
      </TouchableOpacity>
    </View>
  );
}