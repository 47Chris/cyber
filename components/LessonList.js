import React from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LessonList = ({ tests, selectedDayLessonDocs, handleOpenPress }) => {
  const renderItem = ({ item }) => {
    const matchedDoc = selectedDayLessonDocs?.find(
      (doc) => doc.data()?.id === item.id
    );

    return (
      <Pressable
        onPress={() => handleOpenPress(item)}
        style={{
          backgroundColor: "white",
          padding: 12,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 16,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View
            style={{
              width: 16,
              height: 16,
              borderColor: "grey",
              borderWidth: 1,
              borderRadius: 16,
            }}
          ></View>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: "#333333",
                fontWeight: 700,
                textDecorationLine:
                  matchedDoc?.data()?.writing === 100 &&
                  matchedDoc?.data()?.watching === 100
                    ? "line-through"
                    : "none",
              }}
            >
              {item.id} {item.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="eye" size={12} color="grey" />
              <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>
                {matchedDoc?.data()?.watching || 0}
              </Text>
              <Ionicons
                name="create-sharp"
                size={12}
                color="grey"
                style={{ marginLeft: 8 }}
              />
              <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>
                {matchedDoc?.data()?.writing || 0}
              </Text>
            </View>
          </View>
        </View>
        <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>
          {item.duration}
        </Text>
      </Pressable>
    );
  };

  const allVideos = tests.reduce((acc, cur) => acc.concat(cur.videos), []);
  const groupIds = Array.from(
    new Set(allVideos.map((video) => video.id.split(/(?<=\d)\D/)[0]))
  );
  const isGroupComplete = (groupId) =>
    allVideos
      .filter((video) => video.id.startsWith(groupId))
      .every((video) => {
        const doc = selectedDayLessonDocs?.find(
          (doc) => doc.data()?.id === video.id
        );
        return (
          doc && doc.data()?.watching === 100 && doc.data()?.writing === 100
        );
      });

  const currentGroupId = groupIds.find((groupId) => !isGroupComplete(groupId));
  const filteredVideos = allVideos.filter((video) =>
    video.id.startsWith(currentGroupId)
  );

  return (
    <FlatList
      data={filteredVideos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => (
        <View style={{ height: 0.5, width: "100%", marginVertical: 4 }} />
      )}
    />
  );
};

export default LessonList;
