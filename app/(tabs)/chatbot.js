import { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    // 🤖 dummy AI reply (for now)
    const botMsg = {
      id: (Date.now() + 1).toString(),
      text: getBotReply(input),
      sender: "bot",
    };

    setMessages((prev) => [botMsg, userMsg, ...prev]);
    setInput("");
  };

  // 🧠 basic replies (can upgrade later)
  const getBotReply = (text) => {
    text = text.toLowerCase();

    if (text.includes("timetable")) return "📅 Check dashboard timetable section.";
    if (text.includes("class")) return "🎥 Active class will appear on dashboard.";
    if (text.includes("holiday")) return "🏖 Check notifications for holidays.";

    return "🤖 I'm CampusGenie. Ask me about classes, timetable or notifications!";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>

      {/* HEADER */}
      <Text style={{
        fontSize: 20,
        fontWeight: "bold",
        padding: 16
      }}>
        🤖 CampusGenie
      </Text>

      {/* CHAT LIST */}
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                item.sender === "user" ? "#007bff" : "white",
              padding: 10,
              borderRadius: 10,
              marginBottom: 8,
              maxWidth: "75%",
            }}
          >
            <Text style={{
              color: item.sender === "user" ? "white" : "black"
            }}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* INPUT + SEND */}
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          backgroundColor: "white",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 10,
            padding: 10,
            marginRight: 10,
          }}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#007bff",
            paddingHorizontal: 15,
            justifyContent: "center",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}