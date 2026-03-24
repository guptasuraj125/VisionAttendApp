// app/dashboard.jsx — VisionAttend Dashboard v2
// Matches website: light bg, white cards, dark navy, teal accent

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FloatingChat from "../../components/FloatingChat";
import { api } from "../../services/api";

const { width: SW, height: SH } = Dimensions.get("window");

/* ─────────────────────────────────────────
   DESIGN TOKENS — matches VisionAttend website
   • Background: pale blue-gray #ECF2F7
   • Surface: white
   • Navy: #1E2A3A  (headings, nav, icons)
   • Teal: #2DD4BF / #14B8A6  (accent, CTA)
   • Muted: #64748B
───────────────────────────────────────── */
const C = {
  bg:        "#ECF2F7",    // website page background
  bgLight:   "#F4F8FB",
  surface:   "#FFFFFF",    // cards
  surfaceAlt:"#F8FAFC",

  navy:      "#1E2A3A",    // primary text / headers — website nav color
  navyMid:   "#2D3F54",
  navyLight: "#3D5166",

  teal:      "#14B8A6",    // website hero accent / CTA
  tealLight: "#2DD4BF",
  tealPale:  "#CCFBF1",
  tealBorder:"#99F6E4",

  slate600:  "#475569",
  slate500:  "#64748B",
  slate400:  "#94A3B8",
  slate300:  "#CBD5E1",
  slate200:  "#E2E8F0",
  slate100:  "#F1F5F9",

  red:       "#EF4444",
  redPale:   "#FEF2F2",
  redBorder: "#FECACA",

  green:     "#10B981",
  greenPale: "#D1FAE5",

  amber:     "#F59E0B",
  amberPale: "#FEF3C7",

  blue:      "#3B82F6",
  bluePale:  "#EFF6FF",
  blueBorder:"#BFDBFE",

  purple:    "#8B5CF6",
  purplePale:"#F5F3FF",

  white:     "#FFFFFF",
};

/* ─────────────────────────────────────────
   ANIMATED HELPERS
───────────────────────────────────────── */

/* Live pulse dot — teal on website theme */
function LiveDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const op = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 2.4, duration: 950, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(scale, { toValue: 1, duration: 950, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(op, { toValue: 0, duration: 950, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.5, duration: 950, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 14, height: 14, alignItems: "center", justifyContent: "center", marginRight: 5 }}>
      <Animated.View style={{ position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: C.red, opacity: op, transform: [{ scale }] }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.red }} />
    </View>
  );
}

/* Entrance animation */
function FadeIn({ delay = 0, children, style }) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 420, delay, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(ty, { toValue: 0, duration: 420, delay, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, []);
  return <Animated.View style={[style, { opacity: op, transform: [{ translateY: ty }] }]}>{children}</Animated.View>;
}

/* ─────────────────────────────────────────
   BRAND LOGO (matches website nav logo)
───────────────────────────────────────── */
function Logo() {
  const myLogo = require("../../assets/images/logo.png");

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={myLogo}
        style={{
          width: 140,   // 👈 size bada kar diya (adjust kar sakta hai)
          height: 50,
          resizeMode: "contain"
        }}
      />
    </View>
  );
}

/* ─────────────────────────────────────────
   SECTION LABEL — matches website "CORE FEATURES" style
───────────────────────────────────────── */
function Label({ text, onAction }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 6 }}>
      <View>
        <Text style={{ fontSize: 13, fontWeight: "900", color: C.navy, letterSpacing: -0.2, textTransform: "uppercase", letterSpacing: 1.5 }}>
          {text}
        </Text>
        {/* Teal underline accent — like website hero */}
        <View style={{ width: 28, height: 2.5, backgroundColor: C.teal, borderRadius: 2, marginTop: 4 }} />
      </View>
      {onAction && (
        <TouchableOpacity onPress={onAction} style={{
          flexDirection: "row", alignItems: "center", gap: 3,
          backgroundColor: C.tealPale, borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 5,
          borderWidth: 1, borderColor: C.tealBorder,
        }}>
          <Text style={{ fontSize: 10, fontWeight: "800", color: C.teal }}>See all</Text>
          <Text style={{ color: C.teal, fontSize: 12, fontWeight: "700" }}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ─────────────────────────────────────────
   TIMETABLE SLOT CARD
   Styled like website "Role Module" cards — white, bordered, navy icon square
───────────────────────────────────────── */
function SlotCard({ slot, isNow, onPress, index }) {
  const subject = typeof slot.subject === "string" ? slot.subject : slot.subject?.name || "—";
  const teacher = slot.teacherName || (typeof slot.teacher === "string" ? slot.teacher : slot.teacher?.name) || "";
  const sc = useRef(new Animated.Value(1)).current;
  const press  = () => Animated.spring(sc, { toValue: 0.975, useNativeDriver: true, speed: 60 }).start();
  const unpress = () => Animated.spring(sc, { toValue: 1, useNativeDriver: true, speed: 60 }).start();

  return (
    <FadeIn delay={index * 55}>
      <Animated.View style={{ transform: [{ scale: sc }] }}>
        <TouchableOpacity onPress={onPress} onPressIn={press} onPressOut={unpress} activeOpacity={1}>
          <View style={[S.slotCard, isNow && S.slotCardNow]}>
            {/* Dark navy icon box — like website feature icons */}
            <View style={[S.slotIconBox, isNow && { backgroundColor: C.teal }]}>
              <Text style={{ fontSize: 13 }}>📚</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 11 }}>
              <Text style={[S.slotSubject, isNow && { color: C.teal }]} numberOfLines={1}>{subject}</Text>
              {teacher ? <Text style={S.slotTeacher}>{teacher}</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end", gap: 5 }}>
              {isNow && (
                <View style={S.nowBadge}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.teal, marginRight: 4 }} />
                  <Text style={{ color: C.teal, fontSize: 8, fontWeight: "900", letterSpacing: 1 }}>NOW</Text>
                </View>
              )}
              <View style={[S.timePill, isNow && S.timePillNow]}>
                <Text style={[S.timeText, isNow && { color: C.teal }]}>
                  {slot.startTime}{slot.endTime ? `–${slot.endTime}` : ""}
                </Text>
              </View>
              {slot.type && slot.type !== "theory" && (
                <View style={S.typeBadge}>
                  <Text style={S.typeText}>{slot.type}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </FadeIn>
  );
}

/* ─────────────────────────────────────────
   NOTIFICATION ROW
───────────────────────────────────────── */
function NotifRow({ notif, onPress, index }) {
  const typeMap = {
    info:         { icon: "ℹ️", bg: C.bluePale,   border: C.blueBorder,  txt: C.blue },
    warning:      { icon: "⚠️", bg: C.amberPale,  border: "#FDE68A",     txt: C.amber },
    success:      { icon: "✅", bg: C.greenPale,  border: "#A7F3D0",     txt: C.green },
    announcement: { icon: "📢", bg: C.tealPale,   border: C.tealBorder,  txt: C.teal },
  };
  const t = typeMap[notif.type] || { icon: "🔔", bg: C.slate100, border: C.slate200, txt: C.slate600 };
  return (
    <FadeIn delay={index * 45}>
      <TouchableOpacity onPress={onPress} style={S.notifRow} activeOpacity={0.75}>
        <View style={[S.notifIconBox, { backgroundColor: t.bg, borderColor: t.border }]}>
          <Text style={{ fontSize: 13 }}>{t.icon}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[S.notifTitle, { color: notif.read ? C.slate500 : C.navy }]} numberOfLines={1}>{notif.title}</Text>
          <Text style={S.notifMsg} numberOfLines={1}>{notif.message}</Text>
        </View>
        {!notif.read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.teal }} />}
      </TouchableOpacity>
    </FadeIn>
  );
}

/* ─────────────────────────────────────────
   ANNOUNCEMENT CARD — horizontal scroll
───────────────────────────────────────── */
function AnnoCard({ item, index, onPress }) {
  // Category-based colors like the website's feature cards
  const palettes = [
    { bg: C.tealPale,   border: C.tealBorder, accent: C.teal,   catBg: "#CCFBF1", catTxt: "#0F766E" },
    { bg: C.bluePale,   border: C.blueBorder,  accent: C.blue,   catBg: "#DBEAFE", catTxt: "#1D4ED8" },
    { bg: C.purplePale, border: "#DDD6FE",     accent: C.purple, catBg: "#EDE9FE", catTxt: "#7C3AED" },
    { bg: C.amberPale,  border: "#FDE68A",     accent: C.amber,  catBg: "#FEF3C7", catTxt: "#B45309" },
  ];
  const p = palettes[index % palettes.length];
  return (
    <FadeIn delay={index * 60}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={[S.annoCard, { backgroundColor: p.bg, borderColor: p.border, borderTopColor: p.accent }]}>
          <View style={[S.annoCatPill, { backgroundColor: p.catBg }]}>
            <Text style={[S.annoCatText, { color: p.catTxt }]}>{item.category || "General"}</Text>
          </View>
          <Text style={[S.annoTitle, { color: C.navy }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[S.annoBody, { color: C.slate600 }]} numberOfLines={2}>{item.message || item.body}</Text>
          <Text style={{ color: C.slate400, fontSize: 10, marginTop: 10, fontWeight: "600" }}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
          </Text>
        </View>
      </TouchableOpacity>
    </FadeIn>
  );
}

/* ─────────────────────────────────────────
   BOTTOM SHEET
───────────────────────────────────────── */
function Sheet({ visible, onClose, title, children }) {
  const ty = useRef(new Animated.Value(SH)).current;
  const bg = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(ty, { toValue: 0, useNativeDriver: true, tension: 80, friction: 14 }),
        Animated.timing(bg, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(ty, { toValue: SH, duration: 270, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
        Animated.timing(bg, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(30,42,58,0.5)" }, { opacity: bg }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[S.sheet, { transform: [{ translateY: ty }] }]}>
        <View style={S.sheetHandle} />
        <View style={S.sheetHeader}>
          <View>
            <Text style={S.sheetTitle}>{title}</Text>
            <View style={{ width: 24, height: 2, backgroundColor: C.teal, borderRadius: 2, marginTop: 4 }} />
          </View>
          <TouchableOpacity onPress={onClose} style={S.sheetClose}>
            <Text style={{ color: C.slate500, fontSize: 14, fontWeight: "700" }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
export default function Dashboard() {
  const router = useRouter();

  const [user, setUser]                   = useState({ name: "Student" });
  const [activeClass, setActiveClass]     = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [timeLeft, setTimeLeft]           = useState(0);
  const [hasFace, setHasFace]             = useState(false);
  const [todaySlots, setTodaySlots]       = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dashStats, setDashStats]         = useState(null);
  const [refreshing, setRefreshing]       = useState(false);

  const [sheetTT, setSheetTT]     = useState(false);
  const [sheetAnn, setSheetAnn]   = useState(false);
  const [sheetNotif, setSheetNotif] = useState(false);

  const timerRef  = useRef(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAuth(); loadAll();
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) router.replace("/login");
  };
  const loadAll = async () => {
    await Promise.allSettled([fetchUser(), fetchActiveClass(), fetchNotifications(), fetchAnnouncements(), fetchDashStats()]);
  };
  const onRefresh = async () => { setRefreshing(true); await loadAll(); setRefreshing(false); };

  const fetchUser = async () => {
    try {
      const res = await api.get("/students/me");
      const student = res.data?.student || { name: "Student" };
      setUser(student); setHasFace(student?.faceRegistered ?? false);
      fetchTodayTimetable(student);
    } catch { setUser({ name: "Student" }); setTodaySlots([]); }
  };
  const fetchDashStats = async () => {
    try { const res = await api.get("/students/dashboard"); setDashStats(res.data?.data || res.data || null); } catch {}
  };
  const fetchActiveClass = async () => {
    try {
      const res = await api.get("/attendance/active-class");
      if (!res.data?.success) { setActiveClass(null); return; }
      const session = res.data.session;
      setActiveClass(session);
      if (session?.endTime) startTimer(session.endTime);
    } catch { setActiveClass(null); }
  };
  const startTimer = (endTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { clearInterval(timerRef.current); return; }
      setTimeLeft(Math.floor(diff / 1000));
    }, 1000);
  };
  const fetchNotifications = async () => {
    try { const res = await api.get("/notifications/my"); setNotifications(res.data?.notifications || []); } catch { setNotifications([]); }
  };
  const fetchTodayTimetable = async (s) => {
    try {
      const deptId = s?.department?._id || s?.department?.id || (typeof s?.department === "string" ? s.department : null) || s?.batch?._id || s?.batch?.id || (typeof s?.batch === "string" ? s.batch : null);
      const year = s?.year || s?.currentYear || s?.batch?.year;
      const div  = s?.division || s?.batch?.division;
      if (!deptId || !year || !div) return setTodaySlots([]);
      const key = `${deptId}_${year}_${div}`;
      const res = await api.get(`/timetable/today/${key}`);
      setTodaySlots(res.data?.timetable?.slots || []);
    } catch { setTodaySlots([]); }
  };
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements/list");
      const list = res.data?.announcements || res.data?.data || res.data || [];
      setAnnouncements(Array.isArray(list) ? list : []);
    } catch { setAnnouncements([]); }
  };
  const markAllRead = async () => {
    try { await api.patch("/notifications/read-all"); setNotifications(p => p.map(n => ({ ...n, read: true }))); } catch {}
  };
  const markOneRead = async (id) => {
    try {
      if (id) { await api.patch(`/notifications/${id}/read`); setNotifications(p => p.map(n => n._id === id ? { ...n, read: true } : n)); }
      else markAllRead();
    } catch {}
  };
  const logout = async () => { await AsyncStorage.removeItem("token"); router.replace("/login"); };
  const handleAttendance = () => {
    if (!activeClass) { Alert.alert("No Active Class", "No class running right now."); return; }
    router.push("/scan");
  };

  const fmt = (sec) => ({ m: String(Math.floor(sec / 60)).padStart(2, "0"), s: String(sec % 60).padStart(2, "0") });
  const { m, s } = fmt(timeLeft);
  const firstName = user?.name?.split(" ")[0] || "Student";
  const avatarLetter = firstName.charAt(0).toUpperCase();
  const unread = notifications.filter(n => !n.read).length;
  const nowH = new Date().getHours();
  const greeting = nowH < 12 ? "Good morning" : nowH < 17 ? "Good afternoon" : "Good evening";
  const nowTime = `${String(new Date().getHours()).padStart(2,"0")}:${String(new Date().getMinutes()).padStart(2,"0")}`;
  const isNow = (slot) => slot.startTime && slot.endTime && nowTime >= slot.startTime && nowTime <= slot.endTime;
  const pct      = dashStats?.attendancePercent ?? dashStats?.attendance?.percentage ?? dashStats?.percentage ?? null;
  const today    = dashStats?.classesToday ?? todaySlots.length;
  const attended = dashStats?.classesAttended ?? dashStats?.attendance?.attended ?? null;

  /* Stat card — website-style white card with icon */
  const StatBox = ({ value, label, icon, accent, accentBg }) => {
    const sc = useRef(new Animated.Value(0.9)).current;
    useEffect(() => { Animated.spring(sc, { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }).start(); }, []);
    return (
      <Animated.View style={[S.statCard, { transform: [{ scale: sc }] }]}>
        {/* Top colored bar — like website numbered feature rows */}
        <View style={[S.statTopBar, { backgroundColor: accent }]} />
        <View style={{ padding: 14 }}>
          <View style={[S.statIconBox, { backgroundColor: accentBg }]}>
            <Text style={{ fontSize: 14 }}>{icon}</Text>
          </View>
          <Text style={[S.statValue, { color: accent }]}>{value ?? "—"}</Text>
          <Text style={S.statLabel}>{label}</Text>
        </View>
      </Animated.View>
    );
  };

  /* Quick nav button — website "Role Module" card style */
  const QuickBtn = ({ icon, label, onPress, accent, accentBg }) => {
    const sc = useRef(new Animated.Value(1)).current;
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => Animated.spring(sc, { toValue: 0.95, useNativeDriver: true, speed: 60 }).start()}
        onPressOut={() => Animated.spring(sc, { toValue: 1, useNativeDriver: true, speed: 60 }).start()}
        activeOpacity={1} style={{ width: "47.5%" }}
      >
        <Animated.View style={[S.quickCard, { transform: [{ scale: sc }] }]}>
          {/* Dark navy icon box exactly like website role module icons */}
          <View style={[S.quickIconBox, { backgroundColor: C.navy }]}>
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          </View>
          <Text style={S.quickLabel}>{label}</Text>
          <View style={[S.quickArrow, { backgroundColor: accentBg }]}>
            <Text style={{ color: accent, fontSize: 14, fontWeight: "700" }}>›</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.teal} colors={[C.teal]} />}
      >

        {/* ══ NAV BAR — matches website nav ══ */}
        <Animated.View style={[S.navBar, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-10, 0] }) }]
        }]}>
          <Logo />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => setSheetNotif(true)} style={S.navIconBtn}>
              <Text style={{ fontSize: 17 }}>🔔</Text>
              {unread > 0 && (
                <View style={S.badge}>
                  <Text style={S.badgeText}>{unread > 9 ? "9+" : unread}</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Avatar — navy, like website's "Sign In" button */}
            <TouchableOpacity style={S.avatarBtn}>
              <Text style={S.avatarText}>{avatarLetter}</Text>
              <View style={S.onlineDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ══ HERO GREETING — matches website hero layout ══ */}
        <FadeIn delay={80}>
          <View style={S.heroGreet}>
            {/* Teal accent line — same as website watermark/underline */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <View style={{ width: 20, height: 2.5, borderRadius: 2, backgroundColor: C.teal }} />
              <Text style={{ fontSize: 11, color: C.teal, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" }}>{greeting}</Text>
            </View>
            <Text style={S.greetName}>{firstName} 👋</Text>
            <Text style={S.greetDate}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            
            {/* Decorative student illustration area — website has the boy image */}
           <View style={S.heroBoyArea}>
  <Image
    source={require("../../assets/images/heroimg.png")}
    style={{
      width: 190,
      height: 110,
      resizeMode: "contain"
    }}
  />
</View>
          </View>
        </FadeIn>

        {/* ══ FACE NUDGE ══ */}
        {!hasFace && (
          <FadeIn delay={110}>
            <TouchableOpacity style={S.nudge} activeOpacity={0.85}>
              <View style={[S.nudgeIcon, { backgroundColor: C.navy }]}>
                <Text style={{ fontSize: 18 }}>🪪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.nudgeTitle}>Complete Face Registration</Text>
                <Text style={S.nudgeSub}>Required for biometric attendance</Text>
              </View>
              <View style={S.nudgeArrow}><Text style={{ color: C.teal, fontWeight: "700", fontSize: 14 }}>›</Text></View>
            </TouchableOpacity>
          </FadeIn>
        )}

        {/* ══ LIVE CLASS HERO CARD ══ */}
        <FadeIn delay={150}>
          {activeClass ? (
            <View style={S.heroCard}>
              {/* Teal top stripe — website's accent line */}
              <View style={S.heroStripe} />
              <View style={S.heroCardInner}>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    {/* LIVE badge */}
                    <View style={S.livePill}>
                      <LiveDot />
                      <Text style={S.livePillText}>LIVE NOW</Text>
                    </View>
                    <Text style={S.heroSubject} numberOfLines={1}>
                      {activeClass?.subject?.name || "Class in progress"}
                    </Text>
                    <Text style={S.heroTeacher}>{activeClass?.teacher?.name || ""}</Text>
                  </View>
                  {/* Room — website's small info tag */}
                  {activeClass?.room && (
                    <View style={S.roomTag}>
                      <Text style={{ fontSize: 12 }}>📍</Text>
                      <Text style={S.roomText}>Room {activeClass.room}</Text>
                    </View>
                  )}
                </View>

                {/* Timer — navy background boxes */}
                <View style={S.timerRow}>
                  <View style={S.timerBox}>
                    <Text style={S.timerNum}>{m}</Text>
                    <Text style={S.timerLbl}>MIN</Text>
                  </View>
                  <View style={{ gap: 5, paddingHorizontal: 4 }}>
                    <View style={S.colonDot} />
                    <View style={S.colonDot} />
                  </View>
                  <View style={S.timerBox}>
                    <Text style={S.timerNum}>{s}</Text>
                    <Text style={S.timerLbl}>SEC</Text>
                  </View>
                  <Text style={{ color: C.slate400, fontSize: 10, flex: 1, textAlign: "right", alignSelf: "center" }}>
                    time{"\n"}remaining
                  </Text>
                </View>

                {hasFace ? (
                  /* Teal CTA button — matches website's "Sign In" button color */
                  <TouchableOpacity onPress={handleAttendance} style={S.markBtn} activeOpacity={0.88}>
                    <Text style={{ fontSize: 15, marginRight: 6 }}>📸</Text>
                    <Text style={S.markBtnText}>Mark Attendance</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={S.faceWarn}>
                    <Text style={{ fontSize: 13 }}>⚠️</Text>
                    <Text style={S.faceWarnText}>Setup Face ID to mark attendance</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            /* No class state */
            <View style={S.noClassCard}>
              <View style={[S.heroStripe, { backgroundColor: C.slate300 }]} />
              <View style={{ flexDirection: "row", alignItems: "center", padding: 20, gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <View style={S.noClassBadge}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.slate400, marginRight: 5 }} />
                    <Text style={{ fontSize: 8, color: C.slate500, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" }}>Status</Text>
                  </View>
                  <Text style={S.noClassTitle}>No Active Class</Text>
                  <Text style={S.noClassSub}>Check your schedule below for upcoming sessions</Text>
                </View>
                {/* Boy illustration placeholder — teal glow circle */}
                <View style={S.mascot}>
                  <Text style={{ fontSize: 40, lineHeight: 50 }}>🎓</Text>
                  <View style={S.mascotRing} />
                </View>
              </View>
            </View>
          )}
        </FadeIn>

      

        {/* ══ TIMETABLE ══ */}
        <FadeIn delay={240}><Label text="Today's Schedule" onAction={() => setSheetTT(true)} /></FadeIn>
        {todaySlots.length === 0 ? (
          <FadeIn delay={270}>
            <View style={S.emptyCard}><Text style={{ fontSize: 26, marginBottom: 6 }}>🎉</Text><Text style={S.emptyText}>No classes today</Text></View>
          </FadeIn>
        ) : (
          todaySlots.slice(0, 4).map((slot, i) => (
            <SlotCard key={slot._id || i} slot={slot} isNow={isNow(slot)} onPress={() => setSheetTT(true)} index={i} />
          ))
        )}

        {/* ══ ANNOUNCEMENTS ══ */}
        {announcements.length > 0 && (
          <>
            <FadeIn delay={310}><Label text="Announcements" onAction={() => setSheetAnn(true)} /></FadeIn>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 4 }}
            >
              {announcements.slice(0, 5).map((a, i) => (
                <AnnoCard key={a._id || i} item={a} index={i} onPress={() => setSheetAnn(true)} />
              ))}
            </ScrollView>
          </>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        <FadeIn delay={350}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 14 }}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={S.labelText}>Notifications</Text>
                {unread > 0 && (
                  <View style={{ backgroundColor: C.tealPale, borderWidth: 1, borderColor: C.tealBorder, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ color: C.teal, fontSize: 9, fontWeight: "900" }}>{unread} new</Text>
                  </View>
                )}
              </View>
              <View style={{ width: 24, height: 2, backgroundColor: C.teal, borderRadius: 2, marginTop: 4 }} />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {unread > 0 && <TouchableOpacity onPress={markAllRead} style={S.linkBtn}><Text style={S.linkText}>Mark read</Text></TouchableOpacity>}
              <TouchableOpacity onPress={() => setSheetNotif(true)} style={S.linkBtn}><Text style={S.linkText}>See all ›</Text></TouchableOpacity>
            </View>
          </View>
        </FadeIn>
        {notifications.length === 0 ? (
          <FadeIn delay={370}>
            <View style={S.emptyCard}><Text style={{ fontSize: 22, marginBottom: 6 }}>👌</Text><Text style={S.emptyText}>All caught up</Text></View>
          </FadeIn>
        ) : (
          notifications.slice(0, 3).map((n, i) => (
            <NotifRow key={n._id} notif={n} onPress={() => markOneRead(n._id)} index={i} />
          ))
        )}

        {/* ══ QUICK ACCESS — website role module grid ══ */}
        <FadeIn delay={420}>
          <Label text="Quick Access" />
          <View style={S.quickGrid}>
            <QuickBtn icon="📆" label="Timetable"    accent={C.teal}   accentBg={C.tealPale}   onPress={() => setSheetTT(true)} />
            <QuickBtn icon="💬" label="Messages"      accent={C.blue}   accentBg={C.bluePale}   onPress={() => router.push("/chat")} />
            <QuickBtn icon="📢" label="Announcements" accent={C.amber}  accentBg={C.amberPale}  onPress={() => setSheetAnn(true)} />
            <QuickBtn icon="🤖" label="CampusGenie"   accent={C.purple} accentBg={C.purplePale} onPress={() => router.push("/assistant")} />
          </View>
        </FadeIn>

        {/* ══ SIGN OUT ══ */}
        <FadeIn delay={460}>
          <TouchableOpacity onPress={logout} style={S.logoutBtn} activeOpacity={0.85}>
            <Text style={{ fontSize: 14, color: C.slate400 }}>↩</Text>
            <Text style={S.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </FadeIn>

        {/* ══ BRAND FOOTER — matches website footer ══ */}
        <FadeIn delay={480}>
        <View style={S.footer}>
  {/* Footer mein bhi image logo */}
  <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
    <Image 
      source={require("../../assets/images/logo.png")}
      style={{ width: 28, height: 28, resizeMode: "contain" }}
    />
    <Text style={{ fontSize: 12, fontWeight: "900", color: C.navy }}>
      Vision<Text style={{ color: C.teal }}>Attend</Text>
    </Text>
  </View>
  <Text style={S.footerSub}>Full-stack · Role-based ERP · OpenCV Face Recognition · Geo Validation</Text>
  <Text style={S.footerCopy}>© 2025 VisionAttend ERP · Secure Campus Attendance</Text>
</View>
        </FadeIn>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* ══ SHEETS ══ */}
      <Sheet visible={sheetTT} onClose={() => setSheetTT(false)} title="Today's Schedule">
        {todaySlots.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}><Text style={{ fontSize: 32, marginBottom: 10 }}>🎉</Text><Text style={{ color: C.slate500 }}>No classes today</Text></View>
        ) : (
          todaySlots.map((slot, i) => <SlotCard key={slot._id || i} slot={slot} isNow={isNow(slot)} onPress={() => {}} index={i} />)
        )}
      </Sheet>

      <Sheet visible={sheetAnn} onClose={() => setSheetAnn(false)} title="Announcements">
        {announcements.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}><Text style={{ fontSize: 32, marginBottom: 10 }}>📢</Text><Text style={{ color: C.slate500 }}>No announcements</Text></View>
        ) : (
          announcements.map((a, i) => <AnnoCard key={a._id || i} item={a} index={i} onPress={() => {}} />)
        )}
      </Sheet>

      <Sheet visible={sheetNotif} onClose={() => setSheetNotif(false)} title="Notifications">
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead} style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: C.teal, fontWeight: "800", fontSize: 13 }}>✓  Mark all as read</Text>
          </TouchableOpacity>
        )}
        {notifications.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}><Text style={{ fontSize: 32, marginBottom: 10 }}>👌</Text><Text style={{ color: C.slate500 }}>You're all caught up</Text></View>
        ) : (
          notifications.map((n, i) => <NotifRow key={n._id} notif={n} onPress={() => markOneRead(n._id)} index={i} />)
        )}
      </Sheet>

      <FloatingChat />
    </View>
  );
}

/* ══════════════════════════════════════════
   STYLESHEET
══════════════════════════════════════════ */
const S = {
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20 },

  /* Nav bar — website nav */
  navBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 22,
    paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.slate200,
  },
  navIconBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.slate200,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.navy, shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  badge: {
    position: "absolute", top: 4, right: 4,
    backgroundColor: C.red, borderRadius: 7, minWidth: 14, height: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: C.bg, paddingHorizontal: 2,
  },
  badgeText: { color: C.white, fontSize: 7, fontWeight: "900" },
  avatarBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.navy,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.navy, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  avatarText:  { color: C.white, fontSize: 15, fontWeight: "900" },
  onlineDot: {
    position: "absolute", bottom: -1, right: -1,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: C.green, borderWidth: 2, borderColor: C.bg,
  },

  /* Hero greeting section */
  heroGreet: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
    overflow: "hidden",
  },
  greetName: { fontSize: 30, fontWeight: "900", color: C.navy, letterSpacing: -0.8, marginBottom: 4 },
  greetDate: { fontSize: 11, color: C.slate500, fontWeight: "500" },
heroBoyArea: {
  position: "absolute",
  right: -30,   // 👈 push thoda bahar
  top: -1,
},
  heroBoyCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.tealPale,
    borderWidth: 1.5, borderColor: C.tealBorder,
    alignItems: "center", justifyContent: "center",
  },
  heroWatermark: { position: "absolute", bottom: -24, right: -6, transform: [{ rotate: "-5deg" }] },

  /* Nudge */
  nudge: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: C.tealBorder,
    shadowColor: C.teal, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  nudgeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  nudgeTitle: { color: C.navy, fontSize: 13, fontWeight: "800" },
  nudgeSub:   { color: C.slate500, fontSize: 10, marginTop: 2 },
  nudgeArrow: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: C.tealPale, borderWidth: 1, borderColor: C.tealBorder,
    alignItems: "center", justifyContent: "center",
  },

  /* Hero live card */
  heroCard: {
    backgroundColor: C.surface, borderRadius: 20, marginBottom: 16, overflow: "hidden",
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  heroStripe: { height: 4, backgroundColor: C.teal },
  heroCardInner: { padding: 20 },
  livePill: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    backgroundColor: C.redPale, borderWidth: 1, borderColor: C.redBorder,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10,
  },
  livePillText: { color: C.red, fontSize: 9, fontWeight: "900", letterSpacing: 2 },
  heroSubject: { fontSize: 22, fontWeight: "900", color: C.navy, letterSpacing: -0.5, marginBottom: 3 },
  heroTeacher: { fontSize: 12, color: C.slate500 },
  roomTag: {
    flexDirection: "column", alignItems: "center", gap: 2,
    backgroundColor: C.tealPale, borderWidth: 1, borderColor: C.tealBorder,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
  },
  roomText: { color: C.teal, fontSize: 9, fontWeight: "800" },

  /* Timer */
  timerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18, marginTop: 16 },
  timerBox: {
    flex: 1, backgroundColor: C.navy, borderRadius: 12, paddingVertical: 14, alignItems: "center",
    shadowColor: C.navy, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  timerNum:  { color: C.white, fontSize: 30, fontWeight: "900", letterSpacing: -0.8 },
  timerLbl:  { color: C.slate400, fontSize: 7, fontWeight: "900", letterSpacing: 2.5, marginTop: 3 },
  colonDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: C.teal },
  markBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: C.teal, borderRadius: 12, paddingVertical: 14, gap: 8,
    shadowColor: C.teal, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  markBtnText: { color: C.white, fontSize: 14, fontWeight: "900", letterSpacing: 0.2 },
  faceWarn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.amberPale, borderWidth: 1, borderColor: "#FDE68A",
    borderRadius: 10, padding: 12,
  },
  faceWarnText: { color: "#92400E", fontSize: 11, fontWeight: "700", flex: 1 },

  noClassCard: {
    backgroundColor: C.surface, borderRadius: 20, marginBottom: 16, overflow: "hidden",
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  noClassBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.slate100, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: "flex-start", marginBottom: 10,
  },
  noClassTitle: { fontSize: 20, fontWeight: "900", color: C.navy, letterSpacing: -0.3, marginBottom: 4 },
  noClassSub:   { fontSize: 11, color: C.slate500, lineHeight: 16 },
  mascot: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: C.tealPale, borderWidth: 1.5, borderColor: C.tealBorder,
    alignItems: "center", justifyContent: "center",
  },
  mascotRing: { position: "absolute", width: 68, height: 68, borderRadius: 34, backgroundColor: "transparent", borderWidth: 1, borderColor: C.tealBorder, opacity: 0.5 },

  /* Stats */
  statsRow:  { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard:  {
    flex: 1, backgroundColor: C.surface, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statTopBar: { height: 3 },
  statIconBox: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: "900", letterSpacing: -0.4 },
  statLabel: { fontSize: 9, color: C.slate500, fontWeight: "700", marginTop: 2, textTransform: "uppercase", letterSpacing: 1 },

  /* Label */
  labelText: { fontSize: 13, fontWeight: "900", color: C.navy, textTransform: "uppercase", letterSpacing: 1.5 },
  linkBtn: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.slate200,
    borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4,
  },
  linkText: { fontSize: 10, fontWeight: "700", color: C.teal },

  /* Slot card */
  slotCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderRadius: 14, padding: 13, marginBottom: 8,
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  slotCardNow: { borderColor: C.tealBorder, backgroundColor: C.tealPale },
  slotIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.navy, alignItems: "center", justifyContent: "center",
  },
  slotSubject: { fontSize: 13, fontWeight: "800", color: C.navy },
  slotTeacher: { fontSize: 10, color: C.slate500, marginTop: 2 },
  nowBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.tealPale, borderWidth: 1, borderColor: C.tealBorder,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  timePill: {
    backgroundColor: C.slate100, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: C.slate200,
  },
  timePillNow: { backgroundColor: C.tealPale, borderColor: C.tealBorder },
  timeText: { fontSize: 10, fontWeight: "800", color: C.slate500 },
  typeBadge: { backgroundColor: C.navyLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  typeText:  { fontSize: 8, fontWeight: "900", color: C.white, textTransform: "uppercase", letterSpacing: 0.8 },

  /* Announcements */
  annoCard: {
    width: SW * 0.68, borderRadius: 16, padding: 16,
    backgroundColor: C.surface, borderWidth: 1, borderTopWidth: 3, marginBottom: 4,
    shadowColor: C.navy, shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  annoCatPill: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, marginBottom: 8 },
  annoCatText: { fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.5 },
  annoTitle: { fontSize: 14, fontWeight: "900", letterSpacing: -0.3, marginBottom: 5 },
  annoBody:  { fontSize: 11, color: C.slate600, lineHeight: 16 },

  /* Notifications */
  notifRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.03, shadowRadius: 5, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  notifIconBox: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, flexShrink: 0,
  },
  notifTitle: { fontSize: 12, fontWeight: "800", marginBottom: 2 },
  notifMsg:   { fontSize: 10, color: C.slate500 },

  /* Quick grid — website role module cards */
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  quickCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16,
    alignItems: "flex-start", gap: 8,
    borderWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  quickIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  quickLabel: { fontSize: 12, fontWeight: "800", color: C.navy, letterSpacing: -0.1 },
  quickArrow: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },

  /* Logout */
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: C.surface, borderRadius: 12, paddingVertical: 13,
    borderWidth: 1, borderColor: C.redBorder,
  },
  logoutText: { color: C.red, fontSize: 13, fontWeight: "800" },

  /* Empty */
  emptyCard: {
    backgroundColor: C.surface, borderRadius: 12, padding: 22,
    alignItems: "center", marginBottom: 10,
    borderWidth: 1, borderColor: C.slate200,
  },
  emptyText: { color: C.slate500, fontSize: 12, fontWeight: "600" },

  /* Footer */
  footer: {
    marginTop: 16, paddingTop: 20, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: C.slate200,
    alignItems: "center", gap: 6,
  },
  footerSub:  { color: C.slate400, fontSize: 9, textAlign: "center", fontWeight: "500", marginTop: 4 },
  footerCopy: { color: C.slate300, fontSize: 8, textAlign: "center" },

  /* Sheet */
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    maxHeight: SH * 0.88, minHeight: SH * 0.5,
    borderTopWidth: 1, borderColor: C.slate200,
    shadowColor: C.navy, shadowOpacity: 0.15, shadowRadius: 30, shadowOffset: { width: 0, height: -4 }, elevation: 20,
  },
  sheetHandle: {
    width: 34, height: 4, borderRadius: 2,
    backgroundColor: C.slate300, alignSelf: "center", marginTop: 10, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.slate200,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: C.navy, letterSpacing: -0.3 },
  sheetClose: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.slate100, borderWidth: 1, borderColor: C.slate200,
    alignItems: "center", justifyContent: "center",
  },
};