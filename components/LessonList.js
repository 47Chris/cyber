// LessonList.js

import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isToday } from "date-fns";

const LessonList = ({ data, handleOpenPress, selectedDayLessonDocs }) => {
  const ItemSeparatorView = () => {
    return (
      <View
        style={{
          height: 0.5,
          width: "100%",
          // backgroundColor: "#C8C8C8",
          marginVertical: 4,
        }}
      />
    );
  };

  function renderItem({ item }) {
    // Safely find the matched document
    const matchedDoc = selectedDayLessonDocs?.find(
      (doc) => doc.data()?.id === item.id
    );

    // Safely log the data, only if matchedDoc is found
    if (matchedDoc) {
      // console.log(matchedDoc.data().progress); // Log the progress array
    }

    // Determine the highest progress for today
    let maxProgress = { watching: 0, writing: 0 };
    if (matchedDoc?.data()?.progress) {
      matchedDoc.data()?.progress.forEach((entry) => {
        if (isToday(entry.date)) {
          maxProgress = {
            watching: Math.max(maxProgress.watching, entry.watching),
            writing: Math.max(maxProgress.writing, entry.writing),
          };
        }
      });
    }
    if (matchedDoc?.data()?.progress) {
      const { progress } = matchedDoc?.data();

      // Find the latest entry by sorting the progress array by date in descending order
      const latestProgress = progress.sort(
        (a, b) => b.date.seconds - a.date.seconds
      )[0];

      // Reset the form values with the latest found values
      if (latestProgress) {
        maxProgress = {
          watching: latestProgress.watching || 0,
          writing: latestProgress.writing || 0,
        };
      }
    }

    const { watching, writing } = maxProgress;

    return (
      <TouchableOpacity
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
                fontWeight: "700",
                textDecorationLine:
                  watching === 100 && writing === 100 ? "line-through" : "none",
              }}
            >
              {item.id} {item.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="eye" size={12} color="grey" />
                <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>
                  {watching}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <Ionicons name="create-sharp" size={12} color="grey" />
                <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>
                  {writing}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View>
          <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>
            {item.duration}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
};

export default LessonList;
