// FlipCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import {
  interpolate,
  useCode,
  set,
  Value,
  clockRunning,
  Clock,
  startClock,
} from "react-native-reanimated";

const { Clock: RClock, Value: RValue } = Animated;

const FlipCard = ({ value }) => {
  const clock = new RClock();
  const animation = new RValue(0);

  useCode(
    () => [
      set(clockRunning(clock), startClock(clock)),
      set(
        animation,
        interpolate(clock, {
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      ),
    ],
    []
  );

  return (
    <View style={styles.card}>
      <Animated.View
        style={[
          styles.cardFront,
          {
            transform: [
              {
                rotateX: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.cardText}>{value}</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.cardBack,
          {
            transform: [
              {
                rotateX: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["-180deg", "0deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.cardText}>{value}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 100,
    perspective: 1000,
  },
  cardFront: {
    position: "absolute",
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  cardBack: {
    position: "absolute",
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    transform: [{ rotateX: "180deg" }],
  },
  cardText: {
    fontSize: 48,
    fontWeight: "bold",
  },
});

export default FlipCard;
