import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./Timer.styles";
// import TextView from "@/src/components/TextView";
import { Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
// import { tasks } from '../Home/mockData';
// import Task from 'src/components/Task';
import moment from "moment";
import Button from "@/components/Button";
import ModalGiveUp from "./ModalGiveUp";
import { navigate } from "@/navigators/NavigationServices";
import RouteName from "@/navigators/RouteName";
import Config from "react-native-config";
import AppwriteContext from "@/utils/appwrite/AppwriteContext";

const TASK_COLLECTION_ID = Config.TASK_COLLECTION_ID;
const DATABASE_ID = Config.DATABASE_ID;
const FORMAT_TIME = "YYYY-MM-DDTHH:mm:ss.SSSZ";

const Timer = ({ route }) => {
  return <View style={styles.container}></View>;
};

export default Timer;
