import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "@/context/authContext";
import { ToastProvider } from 'react-native-toast-notifications'
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    "TT Interphases Pro Bold": require("../assets/fonts/TT Interphases Pro Bold.otf"),
    "TT Interphases Pro Light": require("../assets/fonts/TT Interphases Pro Light.otf"),
    "TT Interphases Pro Medium": require("../assets/fonts/TT Interphases Pro Medium.otf"),
    "TT Interphases Pro Regular": require("../assets/fonts/TT Interphases Pro Regular.otf"),
    "TT Interphases Pro DemiBold": require("../assets/fonts/TT Interphases Pro DemiBold.otf"),
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
    <SettingsProvider>
    <ToastProvider>
    <AuthProvider>
      <Slot />
    </AuthProvider>
    </ToastProvider></SettingsProvider>
  );
}
