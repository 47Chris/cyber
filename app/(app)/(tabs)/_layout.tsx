import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';

import * as Animatable from "react-native-animatable";

import {
  FlatList,
  GestureHandlerRootView,
  ScrollView,
  TouchableOpacity,
  Swipeable,
} from "react-native-gesture-handler";
import { Feather, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import TabBar from '@/components/TabBar';
import { ThemeProvider } from '@emotion/react'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import { store, persistor } from "@/redux/store";
import { connectToDevTools } from 'react-devtools-core'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AppLoading from 'expo-app-loading'

import { HomeScreen } from '@/src/screens/HomeScreen'
import { StorageService, NotificationsService } from '@/src/services'
import { theme } from '@/src/style/theme'
// import { store } from '@/src/state/store'
import { useAppState } from '@/src/hooks/useAppState'

export default function TabLayout() {

  const appState = useAppState({})
  
  const setupNotifications = async () => {
    NotificationsService.initialize({
      handleNotification: async () => ({
        shouldSetBadge: false,
        shouldPlaySound: appState !== 'active',
        shouldShowAlert: appState !== 'active',
      }),
    })
    if (true) {
      const allowed = await NotificationsService.areNotificationAllowed()
      if (!allowed) {
        NotificationsService.requestPermisions()
      }
    }
  }

  useEffect(() => {
    setupNotifications()
  }, [])

  return (
    <Provider store={store}>
      <StorageService.RestoreState />
      <ThemeProvider theme={theme}>
    <GestureHandlerRootView style={styles.container}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1c49ff',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={'#1c49ff'} />
          ),
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: 'Task',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'clipboard' : 'clipboard-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
    </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 44,
    marginBottom:0,
  },
  h1: {
    fontSize: 40,
    fontWeight: "bold",
  },
  nutrients: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  mealTimes: {
    gap: 16,
  },
  mealTime: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  timeAndCalories: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breakFast: {
    backgroundColor: "#98c14b",
  },
  lunch: {
    backgroundColor: "#e3dc49",
  },
  dinner: {
    backgroundColor: "#e2b953",
  },
  other: {
    backgroundColor: "#b6b5da",
  },
  timeLabel: {
    fontSize: 28,
    color: "white",
    fontWeight: "600",
  },
  calories: {
    color: "white",
  },
  invertedBorderRadius: {
    marginTop: 20,
    position: "relative",
    height: 100,
    width: 325,
    backgroundColor: "#F66969",
    borderTopLeftRadius: 25, // Adjusted for React Native
    borderBottomLeftRadius: 25, // Adjusted for React Native
    borderBottomRightRadius: 25, // Adjusted for React Native
  },
  rectangle: {
    position: "absolute",
    backgroundColor: "#F66969",
    top: 0,
    right: 3,
    height: 50,
    width: 25,
    borderTopLeftRadius: 25,
  },
  triangle: {
    position: "absolute",
    backgroundColor: "#ffffff",
    top: -5,
    right: 3,
    height: 25,
    width: 25,
    borderTopLeftRadius: 25, // Rotating the triangle
    borderBottomRightRadius: 25, // Rotating the triangle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -25 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  btnContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
  },
});