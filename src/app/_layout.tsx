import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PageTransition } from "@/components/PageTransition";
import { C } from "@/theme";

// Bottom-nav tabs cross-fade; every other page slides in from the right.
const TABS = ["index", "cari", "pesanan", "langganan", "akun", "mitra/index", "mitra/order-baru", "mitra/pendapatan", "mitra/profil"];
const tab = { animation: "fade", animationDuration: 180 } as const;

export default function RootLayout() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: C.bg } }}
        screenLayout={({ route, children }) =>
          route.name === "jadwal" ? children : <PageTransition slide={!TABS.includes(route.name)}>{children}</PageTransition>
        }
      >
        {TABS.map((name) => <Stack.Screen key={name} name={name} options={tab} />)}
        <Stack.Screen name="jadwal" options={{ presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } }} />
      </Stack>
    </SafeAreaProvider>
  );
}
