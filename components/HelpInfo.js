import React from "react";
import { View, Text } from "react-native";
import { styles } from "../stylesheet";

const HelpInfo = ({ paused, playing, working }) => {
  return (
    <View>
      <View style={styles.helpInfoContainer}>
        {!paused && !playing && (
          <Text style={styles.smallHelp}>press play to start</Text>
        )}
        {paused && <Text style={styles.smallHelp}>paused</Text>}
      </View>
      <Text style={styles.helpInfo}>
        {working ? "work time" : "break time"}
      </Text>
    </View>
  );
};
export default HelpInfo;
