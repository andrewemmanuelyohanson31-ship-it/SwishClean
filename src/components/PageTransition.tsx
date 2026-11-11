import { ReactNode, useEffect, useState } from "react";
import { Animated, Easing, Platform } from "react-native";

/**
 * Web-only enter animation (fade + short slide). On iOS/Android the native stack
 * already animates screens (see `animation` options in src/app/_layout.tsx).
 */
export function PageTransition({ children, slide = true }: { children: ReactNode; slide?: boolean }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }).start();
  }, [t]);
  if (Platform.OS !== "web") return <>{children}</>;
  const translateX = slide ? t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) : 0;
  return <Animated.View style={{ flex: 1, opacity: t, transform: [{ translateX }] }}>{children}</Animated.View>;
}
