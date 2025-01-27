import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Link, Redirect, useRouter } from "expo-router";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useEffect, useState } from "react";
import { FIREBASE_DB } from "@/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useIsFocused } from "@react-navigation/native";

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentDayProgress, setCurrentDayProgress] = useState(70);
  const [selectedDayLessonDocs, setSelectedDayLessonDocs] = useState(null);
  const [dayLesson, setDayLesson] = useState(0);
  const isFocused = useIsFocused();

  const [priceActionFundementals, setPriceActionFundementals] = useState([]);

  useEffect(() => {
    const fetchPriceActionFundementals = async () => {
      const priceActionFundementalsSnapshot = await getDocs(
        collection(FIREBASE_DB, "priceActionFundementals")
      );
      const fetchedPriceActionFundementals = [];
      priceActionFundementalsSnapshot.forEach((doc) => {
        fetchedPriceActionFundementals.push({ id: doc.id, ...doc.data() });
      });
      setPriceActionFundementals(fetchedPriceActionFundementals);
      // console.log(fetchedPriceActionFundementals.videos);
      // console.log("Number of documents in priceActionFundementals collection: ", priceActionFundementalsSnapshot.size);
    };

    fetchPriceActionFundementals();
  }, []);

  useEffect(() => {
    const fetchDayLessons = async () => {
      try {
        const dayLessonCol = collection(FIREBASE_DB, "dayLesson");

        // Fetch all documents from the 'dayLesson' collection
        const dayLessonSnapshot = await getDocs(dayLessonCol);

        console.log("Total documents fetched:", dayLessonSnapshot.size); // Show the number of documents fetched

        // Filter documents where the latest progress has watching and writing both equal to 100
        const completedLessons = dayLessonSnapshot.docs.filter((doc) => {
          const data = doc.data();

          // Ensure progress exists and is an array
          if (data.progress && Array.isArray(data.progress)) {
            // Find the latest progress entry by sorting the array by date in descending order
            const latestProgress = data.progress.sort(
              (a, b) => b.date.seconds - a.date.seconds
            )[0];

            // Return true if the latest progress has watching and writing equal to 100
            return (
              latestProgress?.watching === 100 &&
              latestProgress?.writing === 100
            );
          }
          return false;
        });

        // console.log("Number of completed lessons:", completedLessons.length);
        setDayLesson(completedLessons.length);
      } catch (error) {
        console.error("Error fetching day lessons:", error);
      }
    };

    fetchDayLessons();
  }, [isFocused]);

  const allvideos = priceActionFundementals.reduce(
    (accumulator, currentValue) => {
      return accumulator.concat(currentValue.videos);
    },
    []
  );

  // console.log(
  //   dayLesson/allvideos.length * 100
  // );

  useEffect(() => {
    // Set the progress to state
    const allvideos = priceActionFundementals.reduce(
      (accumulator, currentValue) => {
        return accumulator.concat(currentValue.videos);
      },
      []
    );
    const progress = dayLesson > 0 ? (dayLesson / allvideos.length) * 100 : 0;
    setCurrentDayProgress(Math.round(progress));
    // console.log(currentDayProgress);
  }, [allvideos.length, dayLesson]);

  let greet = "";

  const date = new Date();
  const hour = date.getHours();
  if (hour < 12) {
    greet = "Morning";
  } else if (hour < 17) {
    greet = "Afternoon";
  } else {
    greet = "Evening";
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text style={styles.homeTitle}>{greet}, Chris</Text>
      </View>
      <View style={styles.progressWrapper}>
        <AnimatedCircularProgress
          size={80}
          width={10}
          fill={currentDayProgress}
          tintColor="#3b76c3"
          backgroundColor="#eee"
        >
          {(fill) => (
            <Text style={{ fontWeight: 600 }}>{currentDayProgress}%</Text>
          )}
        </AnimatedCircularProgress>
        <View>
          <Text style={styles.processTitle}>
            {currentDayProgress < 20
              ? "Let's get going"
              : currentDayProgress < 40
              ? "You're doing great"
              : currentDayProgress < 60
              ? "Almost there"
              : currentDayProgress < 80
              ? "You're doing awesome"
              : "Well done"}
          </Text>
          <Text style={styles.processText}>
            {dayLesson} of {allvideos.length} completed!
          </Text>
        </View>
      </View>

      <Link href={"/fundementals"} asChild>
        <TouchableOpacity style={styles.taskTextWrapper}>
          <View>
            <Text style={styles.taskText}>Price Action Fundamentals</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View>
                <Text style={{
                    fontWeight: 600,
                    fontSize: 16,
                    fontFamily: "SF-UI-Display-Regular",
                  }}>Videos</Text>
                <Text
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    fontFamily: "SF-UI-Display-Bold",
                  }}
                >
                  15/30
                </Text>
              </View>
              <View>
                <Text style={{
                    fontWeight: 600,
                    fontSize: 16,
                    fontFamily: "SF-UI-Display-Regular",
                  }}>Hours</Text>
                <Text
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    fontFamily: "SF-UI-Display-Bold",
                  }}
                >
                  6/12
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 12,
                borderRadius: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontWeight: 600, fontSize: 18, fontFamily: "SF-UI-Display-Bold", }}>50%</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 15,
    backgroundColor: "#f3f3f3",
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  homeTitle: {
    marginTop: 15,
    marginBottom: 15,
    fontWeight: 600,
    fontSize: 24,
  },
  progressWrapper: {
    backgroundColor: "white",
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
  },
  processTitle: {
    fontWeight: 600,
    fontSize: 16,
    marginBottom: 10,
  },
  processText: {
    fontSize: 12,
  },
  taskTextWrapper: {
    backgroundColor: "#b08aff",
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    display: "flex",
    gap: 20,
    marginBottom: 16,
  },
  taskText: {
    fontWeight: 600,
    fontSize: 32,
    fontFamily: "SF-UI-Display-Bold",
  },
});
