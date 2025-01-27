import { Slot, Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { ToastProvider } from "react-native-toast-notifications";
import { SettingsProvider } from "../context/SettingsContext";
import { LessonProvider } from "../context/lessonContext";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Text, View } from "react-native";



export default function RootLayout() {
  const [loaded] = useFonts({
    "SF-UI-Display-Bold": require("../assets/fonts/SF-UI-Display-Bold.ttf"),
    "SF-UI-Display-Medium": require("../assets/fonts/SF-UI-Display-Medium.ttf"),
    "SF-UI-Display-Regular": require("../assets/fonts/SF-UI-Display-Regular.ttf"),
    "SF-UI-Display-Semibold": require("../assets/fonts/SF-UI-Display-Semibold.ttf"),
    "SF-UI-Text-Regular": require("../assets/fonts/SF-UI-Text-Regular.ttf"),
    "SF-UI-Text-Semibold": require("../assets/fonts/SF-UI-Text-Semibold.ttf"),
    "Sorren Ex Black": require("../assets/fonts/Sorren Ex Black.otf"),
    "Sorren Ex Bold": require("../assets/fonts/Sorren Ex Bold.otf"),
    "Sorren Ex Medium": require("../assets/fonts/Sorren Ex Medium.otf"),
    "Sorren Ex SemiBold": require("../assets/fonts/Sorren Ex SemiBold.otf"),

  });
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <LessonProvider>
      <SettingsProvider>
        <ToastProvider >
          <Slot />
        </ToastProvider>
      </SettingsProvider>
    </LessonProvider>
  );
}
