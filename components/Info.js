import React from "react";
import { Linking, View, Text } from "react-native";
import { styles } from "../stylesheet";

const Info = () => {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>
        Created by
        <Text
          style={{ color: "blue" }}
          onPress={() =>
            Linking.openURL("https://www.linkedin.com/in/gorchukanatoly/")
          }
        >
          {" "}
          Anatolii Horchuk
        </Text>
        .
      </Text>
    </View>
  );
};

export default Info;
