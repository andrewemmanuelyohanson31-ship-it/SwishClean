import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { C } from "@/theme";

const tab = { animation: "none" } as const;

export default function RootLayout() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="index" options={tab} />
        <Stack.Screen name="cari" options={tab} />
        <Stack.Screen name="pesanan" options={tab} />
        <Stack.Screen name="langganan" options={tab} />
        <Stack.Screen name="akun" options={tab} />
        <Stack.Screen name="jadwal" options={{ presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } }} />
      </Stack>
    </SafeAreaProvider>
  );
}
