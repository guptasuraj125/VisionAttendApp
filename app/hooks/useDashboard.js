import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function useDashboard() {
  const [timetable, setTimetable] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeClass, setActiveClass] = useState(null);

  const batchKey = "69b1a594c41e7a76c4775d7b_TY_A";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    fetchTimetable();
    fetchNotifications();
    fetchActiveClass();
  };

  const fetchTimetable = async () => {
    try {
      const res = await api.get("/timetable/weekly", {
        params: { batchKey },
      });
      setTimetable(res.data?.timetables || []);
    } catch (err) {
      console.log("Timetable error:", err);
      setTimetable([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/my");
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      console.log("Notification error:", err);
      setNotifications([]);
    }
  };

  const fetchActiveClass = async () => {
    try {
      const res = await api.get("/attendance/active-class");
      setActiveClass(res.data?.session || null);
    } catch {
      setActiveClass(null); // normal case
    }
  };

  return { timetable, notifications, activeClass };
}