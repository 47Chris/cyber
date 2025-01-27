import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';

import {
  FlatList,
  GestureHandlerRootView,
  ScrollView,
  TouchableOpacity,
  Swipeable,
} from "react-native-gesture-handler";
import { Entypo, Feather, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function TabLayout() {


  return (
    <GestureHandlerRootView style={styles.container}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1c49ff',
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons size={28} name={focused ? 'home-variant' : 'home-variant-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: 'Task',
          tabBarIcon: ({ color, focused }) => (
            <Entypo size={24} name={focused ? 'text-document-inverted' : 'text-document'} color={color}  />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons size={28} name={focused ? 'chart-box' : 'chart-box-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
    </GestureHandlerRootView>
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