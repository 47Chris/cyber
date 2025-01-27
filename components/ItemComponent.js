import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ItemComponent = ({ item, handleOpenPress, selectedDayLessonDocs }) => {
  // Logic to determine the progress ...

  return (
    <TouchableOpacity onPress={() => handleOpenPress(item)}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View style={{ gap: 4 }}>
          <Text>
            {item.id} {item.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="eye" size={12} color="grey" />
            <Text>{watching}</Text>
            <Ionicons name="create-sharp" size={12} color="grey" />
            <Text>{writing}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ItemComponent;
