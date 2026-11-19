import { ReactNode, useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_400Regular, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PageTransition } from "@/components/PageTransition";
import { PhoneFrame, shouldFrame } from "@/components/PhoneFrame";
import { hydrate, useStore, useToast } from "@/data/store";
import { C } from "@/theme";
import { ToastHost } from "@/ui";

// Bottom-nav tabs cross-fade; every other page slides in from the right.
const TABS = ["index", "cari", "pesanan", "langganan", "akun", "mitra/index", "mitra/order-baru", "mitra/pendapatan", "mitra/profil"];
const tab = { animation: "fade", animationDuration: 180 } as const;
const sheet = { presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } } as const;
const SHEETS = ["jadwal"];

// Who may open which route. UX only — real access control must live on the server.
// kebijakan is public: sign-up links to the privacy policy & terms before an account exists.
const PUBLIC = ["masuk", "daftar", "mitra/daftar", "mitra/daftar-ktp", "mitra/daftar-wajah", "mitra/verifikasi", "kebijakan/[slug]", "+not-found"];
const SHARED = ["bantuan/index", "bantuan/chat"];
function Guard({ name, children }: { name: string; children: ReactNode }) {
  const role = useStore((s) => s.role);
  if (PUBLIC.includes(name)) return children;
  if (!role) return <Redirect href={{ pathname: "/masuk", params: name.startsWith("mitra/") ? { peran: "mitra" } : {} }} />;
  if (SHARED.includes(name)) return children;
  const need = name.startsWith("mitra/") ? "mitra" : "pelanggan";
  if (role !== need) return <Redirect href={role === "mitra" ? "/mitra" : "/"} />;
  return children;
}

export default function RootLayout() {
  return shouldFrame() ? <PhoneFrame /> : <App />;
}

function App() {
  const [loaded] = useFonts({ Poppins_400Regular, Poppins_700Bold });
  const [ready, setReady] = useState(false);
  const toast = useToast();
  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, []);
  if (!loaded || !ready) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: C.bg } }}
        screenLayout={({ route, children }) => (
          <Guard name={route.name}>
            {SHEETS.includes(route.name) ? children : <PageTransition slide={!TABS.includes(route.name)}>{children}</PageTransition>}
          </Guard>
        )}
      >
        {TABS.map((name) => <Stack.Screen key={name} name={name} options={tab} />)}
        {SHEETS.map((name) => <Stack.Screen key={name} name={name} options={sheet} />)}
      </Stack>
      <ToastHost message={toast} />
    </SafeAreaProvider>
  );
}
