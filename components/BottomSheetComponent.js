import SliderComp from "./SliderComp";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import {
  View,
  Text,
  Button,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import CalendarStrip from "@/components/CalendarStrip";
import moment from "moment";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Config from "react-native-config";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AppTheme } from "@/utils/appConstant";
import TextView from "./TextView";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/firebaseConfig";
import { useToast } from "react-native-toast-notifications";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "firebase/firestore"; // Make sure to import Timestamp if using it
import { useIsFocused } from "@react-navigation/native";

const TASK_COLLECTION_ID = Config.TASK_COLLECTION_ID;
const CATEGORY_COLLECTION_ID = Config.CATEGORY_COLLECTION_ID;
const DATABASE_ID = Config.DATABASE_ID;

const validateSchema = yup.object().shape({
  watching: yup.number().required("Watching is required").min(0),
  writing: yup.number().required("Writing is required").min(0),
});

const BottomSheetComponent = ({
  bottomSheetRef,
  selectedSection,
  handleClosePress,
}) => {
  const isFocused = useIsFocused();

  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [formattedDate, setFormattedDate] = useState("");
  const [customDatesStyles, setCustomDatesStyles] = useState([]);
  const [markedDates, setMarkedDates] = useState([]);
  const [startDate, setStartDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryChoose, setCategoryChoose] = useState(null);
  const [selectedDayLessonDocs, setSelectedDayLessonDocs] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedToday, setCompletedToday] = useState([]);
  const {
    reset,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      writing: 0,
      watching: 0,
    },
    resolver: yupResolver(validateSchema),
  });

  const [cancelButtonText, setCancelButtonText] = useState("Cancel");
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(true);

  const datesBlacklistFunc = (date) => {
    return date.isoWeekday() === 6; // disable Saturdays
  };

  const onDateSelected = (selectedDate) => {
    setSelectedDate(selectedDate);
    setFormattedDate(selectedDate.format("YYYY-MM-DD"));
  };

  const setSelectedDateNextWeek = (date) => {
    const selectedDate = moment(selectedDate).add(1, "week");
    const formattedDate = selectedDate.format("YYYY-MM-DD");
    setSelectedDate(selectedDate);
    setFormattedDate(formattedDate);
  };

  const setSelectedDatePrevWeek = (date) => {
    const selectedDate = moment(selectedDate).subtract(1, "week");
    const formattedDate = selectedDate.format("YYYY-MM-DD");
    setSelectedDate(selectedDate);
    setFormattedDate(formattedDate);
  };

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => {
          setIsSaveButtonVisible(false);
          setCancelButtonText("Close");
        }}
      />
    ),
    []
  );

  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, "priceActionFundementals")
      );
      const fetchedTests = [];
      querySnapshot.forEach((doc) => {
        fetchedTests.push({ id: doc.id, ...doc.data() });
      });
      setTests(fetchedTests);
      // console.log(fetchedTests.videos);
    };

    fetchTest();
  }, [isFocused]);

  // const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (loading) return;
    setLoading(true);

    const currentDate = new Date(); // Get the current date
    const values = { ...getValues() };
    console.log(values);

    const allVideos = tests.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue.videos);
    }, []);

    const selectedVideo =
      allVideos.find((video) => video.id === selectedSection.id) || null;
    console.log("selectedVideo", selectedVideo);

    const selectedDayLesson = await getDocs(
      collection(FIREBASE_DB, "dayLesson")
    );
    const selectedDayLessonDoc = selectedDayLesson.docs.find((doc) => {
      console.log("dayLesson doc id: ", doc.id);
      return doc.data().id === selectedVideo?.id;
    });
    console.log(selectedDayLessonDoc?.id);

    try {
      if (selectedDayLessonDoc?.id !== undefined) {
        // Fetch existing progress history
        const existingProgress = selectedDayLessonDoc.data().progress || [];

        // Append the new progress entry for the current day
        const updatedProgress = [
          ...existingProgress,
          {
            date: currentDate,
            watching: values.watching,
            writing: values.writing,
          },
        ];

        await updateDoc(
          doc(FIREBASE_DB, "dayLesson", selectedDayLessonDoc.id),
          {
            progress: updatedProgress,
          }
        );
      } else {
        // Create a new document with the initial progress entry
        await addDoc(collection(FIREBASE_DB, "dayLesson"), {
          id: selectedSection.id,
          progress: [
            {
              date: currentDate,
              watching: values.watching,
              writing: values.writing,
            },
          ],
        });
      }

      toast.show("Saved", {
        type: "success",
        duration: 4000,
        animationType: "zoom-in",
        placement: "top",
        textStyle: { color: "#ffffff", fontSize: 8, textAlign: "center" },
        style: {
          backgroundColor: "#28a745",
          padding: 0,
          borderRadius: 20,
          width: "100%",
          height: 34,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
        },
      });
    } catch (error) {
      toast.show("Connection error", { type: "error" });
      console.error("Error adding lesson: ", error);
    } finally {
      setLoading(false);
      setCancelButtonText("Close");
      setIsSaveButtonVisible(false);
    }
  };

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

  const values = { ...getValues() };
  useEffect(() => {
    const fetchDayLessons = async () => {
      const selectedDayLesson = await getDocs(
        collection(FIREBASE_DB, "dayLesson")
      );
      setSelectedDayLessonDocs(selectedDayLesson.docs);
    };
    fetchDayLessons();
  }, [values.watching, values.writing]);

  const allvideos = tests.reduce((accumulator, currentValue) => {
    return accumulator.concat(currentValue.videos);
  }, []);

  const groupIds = Array.from(
    new Set(allvideos.map((video) => video.id.split(/(?<=\d)\D/)[0]))
  );

  const isGroupComplete = (groupId) => {
    const groupVideos = allvideos.filter((video) =>
      video.id.startsWith(groupId)
    );

    return groupVideos.every((video) => {
      const dayLessonDoc = selectedDayLessonDocs?.find(
        (doc) => doc.data()?.id === video.id
      );
      // console.log(`Group ${groupId} Video ${video.id}`, dayLessonDoc?.data());

      if (dayLessonDoc) {
        const progressRecords = dayLessonDoc.data()?.progress || [];

        // Check if any progress record meets the criteria
        return progressRecords.some(
          (record) => record.watching === 100 && record.writing === 100
        );
      }

      // Return false if no matching document is found
      return false;
    });
  };

  // console.log(isGroupComplete("02"));

  // Get the current group ID to display
  const getCurrentGroupId = () => {
    for (let groupId of groupIds) {
      if (!isGroupComplete(groupId)) {
        return groupId;
      }
    }
    return null; // or handle cases where all groups are complete
  };

  // Filter videos to display
  const currentGroupId = getCurrentGroupId();
  const filteredVideos = allvideos.filter((video) =>
    video.id.startsWith(currentGroupId)
  );
  console.log("filteredVideos ", filteredVideos);
  const totalDuration = filteredVideos.reduce((acc, video) => {
    const [minutes, seconds] = video.duration.split(":").map(Number);
    return acc + minutes * 60 + seconds;
  }, 0);
  console.log(
    `Total duration of videos in group ${currentGroupId}: ${Math.floor(
      totalDuration / 60
    )} minutes and ${totalDuration % 60} seconds`
  );
  console.log(
    "Total duration of filtered videos humanized: ",
    moment.duration(totalDuration, "seconds").humanize()
  );
  const filteredData = filteredVideos.map((video) => {
    const doc = selectedDayLessonDocs?.find(
      (doc) => doc.data().id === video.id
    );
    return doc ? { ...video, ...doc.data() } : video;
  });
  console.log("filteredData ", filteredData);

  /// Function to convert "mm:ss" duration to seconds
  function convertDurationToSeconds(duration) {
    if (!duration) return 0; // Handle null or undefined duration
    const [minutes, seconds] = duration.split(":").map(Number);
    return (isNaN(minutes) ? 0 : minutes) * 60 + (isNaN(seconds) ? 0 : seconds);
  }

  // Initialize variables to store results
  let writingDurations = {};
  let totalWritingDuration = 0;

  filteredData.forEach((entry) => {
    // Ensure progress is an array and has at least one element
    if (!entry.progress || entry.progress.length === 0) return;

    // Get the latest progress entry (last one in the array)
    const latestProgress = entry.progress[entry.progress.length - 1];

    // Handle cases where progress values might be null or undefined
    const writingPercentage = latestProgress?.writing ?? 0;

    // Convert duration to seconds
    const totalDurationInSeconds = convertDurationToSeconds(entry.duration);

    // Calculate writing duration
    const writingDurationInSeconds =
      (writingPercentage / 100) * totalDurationInSeconds;

    // Store the result
    writingDurations[entry.id] = writingDurationInSeconds;
    totalWritingDuration += writingDurationInSeconds;
    console.log("kilo", entry.id, writingDurationInSeconds);
  });

  // Convert seconds to minutes and seconds for easier reading
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${minutes} minutes and ${secs} seconds`;
  }

  // Log results
  console.log(
    `ID: "05A" Writing Duration: ${formatDuration(writingDurations["07A"])} (${
      writingDurations["07A"]
    } seconds)`
  );
  console.log(
    `ID: "05B" Writing Duration: ${formatDuration(writingDurations["05B"])} (${
      writingDurations["05B"]
    } seconds)`
  );
  console.log(
    `Total Writing Duration: ${formatDuration(
      totalWritingDuration
    )} (${totalWritingDuration} seconds)`
  );

  // Export or use the results elsewhere
  const results = {
    "05A": writingDurations["05A"],
    "05B": writingDurations["05B"],
    total: totalWritingDuration,
  };

  // Function to check if a date is today
  function isToday(date) {
    const today = new Date();
    const givenDate = new Date(date.seconds * 1000); // Convert Firestore Timestamp to Date
    return today.toDateString() === givenDate.toDateString();
  }

  useEffect(() => {
    if (!allvideos.length) return;

    const fetchCompletedToday = async () => {
      try {
        // Fetch all documents from the 'dayLesson' collection
        const q = query(collection(FIREBASE_DB, "dayLesson"));
        const querySnapshot = await getDocs(q);

        // console.log('Total documents fetched:', querySnapshot.size); // Shows the number of documents fetched

        // Extract document data and filter documents that were completed today
        const filteredLessons = querySnapshot.docs
          .map((doc) => doc.data()) // Extract document data
          .filter((data) => {
            // console.log('Document data:', data); // Log each document's data

            // Ensure progress exists and is an array
            if (data.progress && Array.isArray(data.progress)) {
              // Check if any progress entry for today meets the criteria
              const isCompletedToday = data.progress.some(
                (entry) =>
                  isToday(entry.date) &&
                  entry.watching === 100 &&
                  entry.writing === 100
              );

              // console.log("isCompletedToday", isCompletedToday); // Log whether the progress is complete today

              // Find a matching video by id
              const matchedVideo = allvideos.find(
                (video) => video.id === data.id
              );
              // console.log(matchedVideo);

              // Return true if video is matched and lesson is completed today
              return matchedVideo && isCompletedToday;
            }
            return false; // Skip documents without valid progress
          })
          .map((data) => {
            // Find the matched video for each filtered lesson
            const matchedVideo = allvideos.find(
              (video) => video.id === data.id
            );
            return {
              ...data,
              title: matchedVideo ? matchedVideo.title : "Unknown Title",
            };
          });

        console.log("Filtered completed today:", filteredLessons); // Shows the filtered documents with titles
        setCompletedToday(filteredLessons); // Save to state
      } catch (error) {
        console.error("Error fetching completed lessons:", error);
      }
    };

    fetchCompletedToday();
  }, [isFocused]); // Add allvideos to dependency array if it's a state or prop

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onClose={handleClosePress}
    >
      <View style={{ padding: 20 }}>
        {/* <Button
              title="Close" onPress={handleClosePress}
            /> */}
        <Text style={{ color: "#333333", fontWeight: 700, marginBottom: 4 }}>
          {selectedSection?.id} {selectedSection?.title}
        </Text>
        {selectedSection?.topics?.map((topic, index) => (
          <Text key={index}>{topic}</Text>
        ))}
        <View
          style={{
            marginTop: 20,
            height: 40,
          }}
        >
          <SliderComp
            title="Watching"
            minimumValue={0}
            maximumValue={100}
            fieldName="watching"
            value={getValues("watching")}
            control={control}
            onChange={(value) => {
              setValue("watching", value);
              setTrigger((prev) => prev + 1);
              setIsSaveButtonVisible(true);
              setCancelButtonText("Cancel");
            }}
            errorMessage={errors?.sessions?.message}
          />
        </View>

        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
            height: 40,
          }}
        >
          <SliderComp
            title="Writing"
            minimumValue={0}
            maximumValue={100}
            // step={5}
            fieldName="writing"
            value={getValues("writing")}
            control={control}
            onChange={(value) => {
              setValue("writing", value);
              setTrigger((prev) => prev + 1);
              setIsSaveButtonVisible(true);
              setCancelButtonText("Cancel");
            }}
            errorMessage={errors?.writing?.message}
          />
        </View>

        <View style={{}}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            {isSaveButtonVisible && (
              <Pressable
                style={{
                  backgroundColor: "#3b76c3",
                  padding: 8,
                  borderRadius: 24,
                  paddingVertical: 12,
                }}
                onPress={() => {
                  submit();
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size={24} color={"white"} />
                ) : (
                  <TextView style={{ color: "white", textAlign: "center" }}>
                    Save
                  </TextView>
                )}
              </Pressable>
            )}
            <Pressable
              style={{
                // backgroundColor: AppTheme.colors.neutral_30,
                paddingVertical: 12,
              }}
              onPress={() => handleClosePress()}
            >
              <TextView
                style={{
                  color: "#3b76c3",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {cancelButtonText}
              </TextView>
            </Pressable>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

export default BottomSheetComponent;
