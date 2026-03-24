import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";

// Simple Black & White Colors
const colors = {
  white: "#FFFFFF",
  black: "#000000",
  grayLight: "#F5F5F5",
  grayMedium: "#E0E0E0",
  grayDark: "#666666",
  grayDarker: "#333333",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications/my");
      setNotifications(res.data?.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isOpen = openId === item._id;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpenId(isOpen ? null : item._id)}
        style={{
          marginBottom: 12,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.grayMedium,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isOpen ? colors.grayLight : colors.white,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              backgroundColor: colors.grayLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              borderWidth: 1,
              borderColor: colors.grayMedium,
            }}
          >
            <Text style={{ fontSize: 18 }}>📢</Text>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.black,
                marginBottom: 4,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.grayDark,
              }}
            >
              {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>

          {/* Expand Icon */}
          <Text style={{ fontSize: 16, color: colors.grayDark }}>
            {isOpen ? "▼" : "▶"}
          </Text>
        </View>

        {/* Message - Expandable */}
        {isOpen && (
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: colors.grayMedium,
              backgroundColor: colors.white,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: colors.grayDarker,
                lineHeight: 20,
              }}
            >
              {item.message}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      {/* Header */}
      <View
        style={{
          padding: 20,
          paddingTop: 60,
          borderBottomWidth: 1,
          borderBottomColor: colors.grayMedium,
          backgroundColor: colors.white,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: colors.black,
          }}
        >
          Notifications
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.grayDark,
            marginTop: 4,
          }}
        >
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 30,
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              padding: 40,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.grayDark,
                textAlign: "center",
              }}
            >
              No notifications yet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.grayMedium,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              You're all caught up!
            </Text>
          </View>
        }
      />
    </View>
  );
}