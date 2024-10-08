import React, { memo } from "react";
import TextView from "../TextView";
import { StyleSheet, View } from "react-native";
import TouchableDebounce from "../TouchableDebounce";
import FastImage from "react-native-fast-image";
// import ReadImg from "@/assets/images/task/read.png";
// import Laptop from "@/assets/images/task/laptop.png";
// import LearningCode from "@/assets/images/task/learning-code.png";
// import Meditation from "@/assets/images/task/meditation.png";
// import Music from "@/assets/images/task/music.png";
// import Dumbbell from "@/assets/images/task/dumbbel.png";
// import Running from "@/assets/images/task/running.png";
// import Working from "@/assets/images/task/working.png";
// import Writing from "@/assets/images/task/writing.png";

import { AppTheme } from "@/utils/appConstant";
import { navigate } from "@/navigators/NavigationServices";
import RouteName from "@/navigators/RouteName";
import moment from "moment";

const TaskComponent = ({ item }) => {
  const handleStartTimer = () => {
    navigate(RouteName.Timer, { item });
  };

  const handleRenderImage = (cate) => {
    const CATEGORIES = {
      reading: ReadImg,
      Study: ReadImg,
      listening: Music,
      Lean: LearningCode,
      Excercise: Dumbbell,
      exercice: Dumbbell,
      tech: Laptop,
      meditation: Meditation,
      running: Running,
      Work: Working,
      working: Working,
      Japanese: Writing,
    };

    return CATEGORIES[cate];
  };

  return (
    <View style={styles.taskContainer}>
      <View style={styles.taskContainWrapper}>
        {/* <Image
          source={handleRenderImage(item?.category_id?.name)}
          style={{
            width: 50,
            height: 50,
          }}
        /> */}
        <View>
          <TextView style={styles.taskTitle}>{item?.title}</TextView>
          <TextView>{item?.duration} minutes</TextView>
          {/* {item?.is_done && <TextView>{item?.category_id?.name}</TextView>} */}
        </View>
      </View>
      {!item?.is_done && (
        <TouchableDebounce onPress={handleStartTimer} style={styles.playButton}>
          <View style={styles.playIcon} />
        </TouchableDebounce>
      )}
      {item?.is_done && (
        <View style={styles.taskCompletedText}>
          <TextView style={styles.totalTimeText}>
            {item?.duration} mins
          </TextView>
          <TextView>
            {moment(item?.start_time, "HH:mm:ss").format("HH:mm")} -{" "}
            {moment(item?.end_time, "HH:mm:ss").format("HH:mm")}
          </TextView>
        </View>
      )}
    </View>
  );
};

export default memo(TaskComponent);

const styles = StyleSheet.create({
  taskContainer: {
    marginVertical: 10,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: "space-between",
    borderRadius: 15,
  },
  taskContainWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  taskTitle: {
    color: "black",
    fontWeight: 600,
    fontSize: AppTheme.fontSize.s14,
  },
  playButton: {
    backgroundColor: "#23c268",
    width: 50,
    height: 50,
    borderRadius: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 0,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    borderLeftColor: "transparent",
    transform: [
      {
        translateX: 3,
      },
      {
        rotate: "90deg",
      },
    ],
  },
  taskCompletedText: {
    display: "flex",
    flexDirection: "column",
  },
  totalTimeText: {
    fontWeight: 600,
    fontSize: AppTheme.fontSize.s14,
  },
});
