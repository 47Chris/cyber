// CircularProgress.js

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Circle } from "react-native-svg";
import Svg from "react-native-svg";

const { width } = Dimensions.get("window");
const radius = width / 2 - 20; // Make circle fit the screen width with padding
const strokeWidth = 15; // Increased stroke width for better visibility

const CircularProgress = ({ progress, timeText, sessionText }) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={width} height={width}>
        <Circle
          stroke="#e6e6e6"
          fill="none"
          cx={width / 2}
          cy={width / 2}
          r={normalizedRadius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#3498db"
          fill="none"
          cx={width / 2}
          cy={width / 2}
          r={normalizedRadius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.timeText}>{timeText}</Text>
        <Text style={styles.sessionText}>{sessionText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: width,
    height: width,
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  timeText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#3498db",
  },
  sessionText: {
    fontSize: 20,
    color: "#3498db",
  },
});

export default CircularProgress;
