import React from "react";
import { View, Button } from "react-native";
import { styles } from "../stylesheet";

const Buttons = ({ title, onPress }) => (
  <View style={styles.button}>
    <Button
      title={title}
      onPress={onPress}
      color="white"
      accessibilityLabel={title}
    />
  </View>
);

export default Buttons;
