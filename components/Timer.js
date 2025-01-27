// FlipTimer.js
import React from "react";
import { View, StyleSheet } from "react-native";
import FlipCard from "./FlipCard";

const Timer = ({ minutes, seconds }) => {
  const minuteTens = Math.floor(minutes / 10);
  const minuteUnits = minutes % 10;
  const secondTens = Math.floor(seconds / 10);
  const secondUnits = seconds % 10;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <FlipCard value={minuteTens} />
        <FlipCard value={minuteUnits} />
      </View>
      <View style={styles.row}>
        <FlipCard value={secondTens} />
        <FlipCard value={secondUnits} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
});

export default Timer;
