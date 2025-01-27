import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

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
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import SliderComp from "@/components/SliderComp";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import TextView from "@/components/TextView";
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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

import { intervalToDuration } from "date-fns";
import { RatingBar } from "@aashu-dubey/react-native-rating-bar";

import useFormatToDigits from "../../../utils/hooks/useFormatToDigits"

const validateSchema = yup.object().shape({
  watching: yup.number().required("Watching is required").min(0),
  writing: yup.number().required("Writing is required").min(0),
  rating: yup.number().required("Writing is required").min(0).max(5),
});
const App = () => {
  const isFocused = useIsFocused();
  const { formatToDigits } = useFormatToDigits(); // Use the hook

  

  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [selectedDayLessonDocs, setSelectedDayLessonDocs] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
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
      rating: 0,
    },
    resolver: yupResolver(validateSchema),
  });

  const [cancelButtonText, setCancelButtonText] = useState("Cancel");
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(true);
  const [completedToday, setCompletedToday] = useState([]);

  const [selectedSection, setSelectedSection] = useState(null);

  const fetchDayLesson = async (videoId) => {
    try {
      const q = query(collection(FIREBASE_DB, "dayLesson"), where("id", "==", videoId));
      const snapshot = await getDocs(q);
      return snapshot.docs[0] || null;
    } catch (error) {
      console.error("Error fetching dayLesson:", error);
      toast.show("Error fetching data", { type: "error" });
      return null;
    }
  };
  

  const handleOpenPress = useCallback(async (item) => {
    setSelectedSection(item);
    bottomSheetRef.current?.expand();
    const dayLessonDoc = await fetchDayLesson(item.id);
    const latestProgress = dayLessonDoc?.data()?.progress?.sort((a, b) => b.date.seconds - a.date.seconds)[0];
  
    reset({
      watching: latestProgress?.watching || 0,
      writing: latestProgress?.writing || 0,
      rating: latestProgress?.rating || 0,
    });
  }, []);
  

  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, "priceActionFundamentals")
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
  
    const values = { ...getValues() };
    const allVideos = tests.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue.videos);
    }, []);
  
    const selectedVideo =
      allVideos.find((video) => video.id === selectedSection.id) || null;
  
    if (!selectedVideo) {
      toast.show("No video selected", { type: "error" });
      setLoading(false);
      return;
    }
  
    try {
      const dayLessonRef = doc(FIREBASE_DB, "dayLesson", selectedSection.id);
  
      // Fetch the existing document
      const dayLessonDoc = await getDoc(dayLessonRef);
  
      if (dayLessonDoc.exists()) {
        // Fetch existing progress history
        const existingProgress = dayLessonDoc.data().progress || [];
  
        // Append the new progress entry for the current day
        const updatedProgress = [
          ...existingProgress,
          {
            date: new Date(),
            watching: values.watching,
            writing: values.writing,
            rating: values.rating,
          },
        ];
  
        // Update the document
        await updateDoc(dayLessonRef, {
          progress: updatedProgress,
        });
      } else {
        // Create a new document with the specified ID
        await setDoc(dayLessonRef, {
          id: selectedSection.id,
          progress: [
            {
              date: new Date(),
              watching: values.watching,
              writing: values.writing,
              rating: values.rating,
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
        render: () => (
          <View style={styles.toastContainer}>
            <MaterialIcons name="check-circle" size={24} color="black" />
            <Text style={styles.toastText}>Saved</Text>
          </View>
        ),
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
      fetchDayLessons(); // Call fetchDayLessons here
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
  const fetchDayLessons = async () => {
      const selectedDayLesson = await getDocs(
        collection(FIREBASE_DB, "dayLesson")
      );
      setSelectedDayLessonDocs(selectedDayLesson.docs);
    };
  useEffect(() => {
    
    fetchDayLessons();
  }, [isFocused, values.watching, values.writing, values.rating]);

  const calculateProgress = (item) => {
    const doc = selectedDayLessonDocs?.find((d) => d.data()?.id === item.id);
    if (!doc) return { watching: 0, writing: 0, rating: 0 };
  
    const latestProgress = doc.data()?.progress?.sort((a, b) => b.date.seconds - a.date.seconds)[0];
    return {
      watching: latestProgress?.watching || 0,
      writing: latestProgress?.writing || 0,
      rating: latestProgress?.rating || 0
    };
  };
  
  function renderItem({ item }) {
    const { watching, writing } = calculateProgress(item);
    const textDecoration = watching === 100 && writing === 100 ? "line-through" : "none";
  
    return (
      <TouchableOpacity onPress={() => handleOpenPress(item)} style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <View style={styles.circle} />
          <View>
            <Text style={{ ...styles.itemTitle, textDecorationLine: textDecoration }}>
              {item.id} {item.title}
            </Text>
            <View style={styles.progressContainer}>
              <Ionicons name="eye" size={12} color="grey" />
              <Text style={styles.progressText}>{watching}</Text>
              <Ionicons name="create-sharp" size={12} color="grey" style={{ marginLeft: 8 }} />
              <Text style={styles.progressText}>{writing}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.durationText}>{item.duration}</Text>
      </TouchableOpacity>
    );
  }
  

  const allvideos = tests.reduce((accumulator, currentValue) => {
    return accumulator.concat(currentValue.videos);
  }, []);

  // console.log(
  //   allvideos.filter(video =>
  //     selectedDayLessonDocs.some(doc => doc.data().id === video.id)
  //   )
  // );

  // Extract unique group IDs
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

      if (dayLessonDoc) {
        const progressRecords = dayLessonDoc.data()?.progress || [];

        if (progressRecords.length > 0) {
          // Sort progress records by date in descending order to get the latest one
          const latestProgress = progressRecords.sort(
            (a, b) => b.date.toMillis() - a.date.toMillis()
          )[0];

          // Check if the latest progress record meets the criteria
          return (
            latestProgress.watching === 100 && latestProgress.writing === 100
          );
        }
      }

      // Return false if no matching document is found or no progress records exist
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

  const totalDuration = filteredVideos.reduce((acc, video) => {
    const [minutes, seconds] = video.duration.split(":").map(Number);
    return acc + minutes * 60 + seconds;
  }, 0);

  const filteredData = filteredVideos.map((video) => {
    const doc = selectedDayLessonDocs?.find(
      (doc) => doc.data().id === video.id
    );
    return doc ? { ...video, ...doc.data() } : video;
  });

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
  });

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

        // Extract document data and filter documents that were completed today
        const filteredLessons = querySnapshot.docs
          .map((doc) => doc.data()) // Extract document data
          .filter((data) => {
            // Ensure progress exists and is an array
            if (data.progress && Array.isArray(data.progress)) {
              // Sort progress records by date in descending order to get the latest one
              const latestProgress = data.progress.sort(
                (a, b) => b.date.toMillis() - a.date.toMillis()
              )[0];

              // Check if the latest progress record is from today and meets the criteria
              const isCompletedToday =
                isToday(latestProgress.date) &&
                latestProgress.watching === 100 &&
                latestProgress.writing === 100;

              // Find a matching video by id
              const matchedVideo = allvideos.find(
                (video) => video.id === data.id
              );

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
        // Shows the filtered documents with titles
        setCompletedToday(filteredLessons); // Save to state
      } catch (error) {
        console.error("Error fetching completed lessons:", error);
      }
    };

    fetchCompletedToday();
  }, [isFocused]); // Add allvideos to dependency array if it's a state or prop

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  

  // renders
  return (
    <GestureHandlerRootView style={styles.container}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "row",
          gap: 24,
        }}
      >
        <View>
          <Text
            style={{
              color: "#3b76c3",
              textAlign: "center",
              fontSize: 60,
              fontFamily: "Sorren Ex SemiBold",
            }}
          >
            {formatToDigits(totalWritingDuration)}
          </Text>
          <Text style={{ color: "grey", textAlign: "center", fontSize: 12 }}>
            Elapsed Time
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: "#3b76c3",
              textAlign: "center",
              fontSize: 60,
              fontFamily: "Sorren Ex SemiBold",
            }}
          >
            {formatToDigits(totalDuration)}
          </Text>
          <Text style={{ color: "grey", textAlign: "center", fontSize: 12 }}>
            Estimated Time
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 12 }}>
        <FlatList
          data={filteredVideos}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={ItemSeparatorView}
          // ref={flatListRef}
          // simultaneousHandlers={panRef}
          renderItem={renderItem}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          marginVertical: 20,
          paddingHorizontal: 12,
        }}
      >
        <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: showCompleted ? "#3b76c3" : "black" }}>
              {showCompleted ? "Hide completed today" : "Show completed today"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {showCompleted && (
        <View style={{ paddingHorizontal: 12 }}>
          <FlatList
            data={completedToday}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            // ref={flatListRef}
            // simultaneousHandlers={panRef}
            renderItem={renderItem}
          />
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={-1} // Start with the bottom sheet closed
        snapPoints={useMemo(() => ["25%", "60%"], [])} // Define snap points
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        style={{ elevation: 5 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            opacity={0.5} // Customize the opacity of the backdrop
          />
        )}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={{ flex: 1, padding: 16 }}>
            {/* <Button
              title="Close" onPress={handleClosePress}
            /> */}
            <Text
              style={{ color: "#333333", fontWeight: 700, marginBottom: 4 }}
            >
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

            <View
  style={{
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <RatingBar
    initialRating={getValues("rating") || 0} // Use form state or default to 3
    itemCount={5} // The number of rating items (stars or icons)
    itemPadding={4} // Padding between each item
    itemBuilder={(index) => {
      switch (index) {
        case 0:
          return (
            <MaterialIcons
              name="sentiment-very-dissatisfied"
              color="#F44336"
              size={30}
            />
          );
        case 1:
          return (
            <MaterialIcons
              name="sentiment-dissatisfied"
              color="#ff7c0b"
              size={30}
            />
          );
        case 2:
          return (
            <MaterialIcons
              name="sentiment-neutral"
              color="#FFC107"
              size={30}
            />
          );
        case 3:
          return (
            <MaterialIcons
              name="sentiment-satisfied"
              color="#8BC34A"
              size={30}
            />
          );
        case 4:
          return (
            <MaterialIcons
              name="sentiment-very-satisfied"
              color="#4CAF50"
              size={30}
            />
          );
        default:
          return <View />;
      }
    }}
    onRatingUpdate={(value) => {
      setValue("rating", value); // Store the rating in form state
      setTrigger((prev) => prev + 1); // Trigger a re-render (or revalidation)
    }}
  />
</View>


            <View style={{ marginTop: 16 }}>
      <Pressable
        style={{
          backgroundColor: "#3b76c3",
          padding: 8,
          borderRadius: 24,
          paddingVertical: 12,
        }}
        onPress={() => {
          // Set both sliders to 100
          setValue("watching", 100);
          setValue("writing", 100);
          setTrigger((prev) => prev + 1); // Trigger a re-render if needed
          setIsSaveButtonVisible(true);
          setCancelButtonText("Cancel");
        }}
      >
        <TextView style={{ color: "white", textAlign: "center" }}>
          Set to 100
        </TextView>
      </Pressable>
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
                      <ActivityIndicator size={18} color={"white"} />
                    ) : (
                      <TextView style={{ color: "white", textAlign: "center" }}>
                        Save
                      </TextView>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efefef",
  },
  contentContainer: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: "white",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    marginBottom: 8,
  },
  itemContent: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 16,
    height: 16,
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 12,
  },
  itemTitle: { fontWeight: "700", color: "#333333" },
  progressContainer: { flexDirection: "row", alignItems: "center" },
  progressText: { fontSize: 12, color: "grey", marginLeft: 4 },
  durationText: { fontSize: 12, color: "grey" },
});

export default App;
