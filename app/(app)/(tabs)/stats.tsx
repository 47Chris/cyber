import { View, Text, Button, Image, Pressable, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import { addDoc, collection, getDocs, query,  } from 'firebase/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';

import { isWithinInterval } from 'date-fns';

import {BarChart} from 'react-native-gifted-charts';

import {
    endOfWeek,
    format,
    startOfWeek,
    subWeeks,
    addWeeks,
  } from "date-fns";
import { FontAwesome6, Ionicons } from '@expo/vector-icons';

const GroupedBars = () => {
  const { height, width } = useWindowDimensions();

    
  const isFocused = useIsFocused();
  const [tests, setTests] = useState([])
  const [selectedDayLessonDocs, setSelectedDayLessonDocs] = useState(null);
  const [completedToday, setCompletedToday] = useState([]);
  const [completedThisWeek, setCompletedThisWeek] = useState([]);
  const [fetchAttemptedThisWeek, setFetchAttemptedThisWeek] = useState([]);
  
  // Helper function to get day label
  const getDayLabel = (date) => {
    const day = date.getDay();
    switch (day) {
      case 0: return 'Sun';
      case 1: return 'Mon';
      case 2: return 'Tue';
      case 3: return 'Wed';
      case 4: return 'Thu';
      case 5: return 'Fri';
      case 6: return 'Sat';
      default: return '';
    }
  };
  
  // Convert duration string (e.g., "32:12") to total seconds
  const getDurationInSeconds = (duration) => {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  };
  
  // Initializing an object to hold sums by day of the week
  const aggregatedData = {
    Mon: { writingElapsedTime: 0, watchingElapsedTime: 0 },
    Tue: { writingElapsedTime: 0, watchingElapsedTime: 0 },
    Wed: { writingElapsedTime: 0, watchingElapsedTime: 0 },
    Thu: { writingElapsedTime: 0, watchingElapsedTime: 0 },
    Fri: { writingElapsedTime: 0, watchingElapsedTime: 0 },
    Sat: { writingElapsedTime: 0, watchingElapsedTime: 0 },
    Sun: { writingElapsedTime: 0, watchingElapsedTime: 0 },
  };

// Grouping data by day of the week and summing elapsed watching and writing times (in minutes)
fetchAttemptedThisWeek.forEach(({ progress, duration }) => {
  if (!progress || !Array.isArray(progress) || progress.length < 2) return;

  // Sort progress by date to ensure they're in chronological order
  const sortedProgress = progress.sort((a, b) => new Date(a.date.seconds * 1000 + a.date.nanoseconds / 1000000) - new Date(b.date.seconds * 1000 + b.date.nanoseconds / 1000000));

  for (let i = 1; i < sortedProgress.length; i++) {
    const prevEntry = sortedProgress[i - 1];
    const currentEntry = sortedProgress[i];

    const prevDate = new Date(prevEntry.date.seconds * 1000 + prevEntry.date.nanoseconds / 1000000);
    const currentDate = new Date(currentEntry.date.seconds * 1000 + currentEntry.date.nanoseconds / 1000000);

    // If current and previous entries are on the same day, skip this iteration
    if (getDayLabel(prevDate) === getDayLabel(currentDate)) continue;

    // Calculate progress for the current day as the difference from the previous day
    const dayLabel = getDayLabel(currentDate);
    const watchingProgressToday = currentEntry.watching - prevEntry.watching;
    const writingProgressToday = currentEntry.writing - prevEntry.writing;

    const durationInSeconds = getDurationInSeconds(duration);

    // Calculate the time spent watching and writing based on the progress difference
    const watchingElapsedTimeInMinutes = (watchingProgressToday / 100) * (durationInSeconds / 60);
    const writingElapsedTimeInMinutes = (writingProgressToday / 100) * (durationInSeconds / 60);

    // Only add progress if it's positive (progress made on that day)
    if (watchingElapsedTimeInMinutes > 0 || writingElapsedTimeInMinutes > 0) {
      aggregatedData[dayLabel].writingElapsedTime += Math.max(writingElapsedTimeInMinutes, 0);
      aggregatedData[dayLabel].watchingElapsedTime += Math.max(watchingElapsedTimeInMinutes, 0);
    }
  }
});


// Now, create the barData array based on elapsed time in minutes (not percentages)
const barData = Object.entries(aggregatedData).flatMap(([dayLabel, { writingElapsedTime, watchingElapsedTime }]) => {
  return [
    {
      value: watchingElapsedTime,  // Use minutes for watching
      label: dayLabel,  // Always add label to the watching bar
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: { color: 'gray' },
      frontColor: '#407cff',
    },
    {
      frontColor: '#fbb03b',
      value: writingElapsedTime,  // Use minutes for writing
    }
  ];
});

console.log(barData);


  



  const [isLoading, setIsLoading] = useState(false);

  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  ); // Initialize with the current week start date

  const goToPreviousWeek = () => {
    setCurrentWeekStartDate(subWeeks(currentWeekStartDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStartDate(addWeeks(currentWeekStartDate, 1));
  };

  const formattedStartDate = format(currentWeekStartDate, "dd MMM");
  const formattedEndDate = format(
    endOfWeek(currentWeekStartDate, { weekStartsOn: 1 }),
    "dd MMM yy"
  );

  const startOfWeekDate = startOfWeek(currentWeekStartDate, {
    weekStartsOn: 1,
  }); // 1 for Monday
  const endOfWeekDate = endOfWeek(currentWeekStartDate, { weekStartsOn: 1 }); // 1 for Monday


  function isToday(date) {
    const today = new Date();
    const givenDate = new Date(date.seconds * 1000); // Convert Firestore Timestamp to Date
    return today.toDateString() === givenDate.toDateString();
  }

  


      useEffect(() => {
        const fetchDayLessons = async () => {
          const selectedDayLesson = await getDocs(collection(FIREBASE_DB, "dayLesson"));
          setSelectedDayLessonDocs(selectedDayLesson.docs);
        };
        fetchDayLessons();
      }, []);

      useEffect(() => {
        const fetchTest = async () => {
          const querySnapshot = await getDocs(collection(FIREBASE_DB, "priceActionFundementals"));
          const fetchedTests = [];
          querySnapshot.forEach((doc) => {
            fetchedTests.push({ id: doc.id, ...doc.data() });
          });
          setTests(fetchedTests);
          // console.log(fetchedTests.videos);
        };
    
        fetchTest();
      }, [isFocused]);

      useEffect(() => {
        if (!allvideos.length) return;
      
        const fetchCompletedToday = async () => {
          try {
            // Fetch all documents from the 'dayLesson' collection
            const q = query(collection(FIREBASE_DB, 'dayLesson'));
            const querySnapshot = await getDocs(q);
      
            // console.log('Total documents fetched:', querySnapshot.size); // Shows the number of documents fetched
      
            // Extract document data and filter documents that were completed today
            const filteredLessons = querySnapshot.docs
              .map(doc => doc.data()) // Extract document data
              .filter(data => {
                // console.log('Document data:', data); // Log each document's data
      
                // Ensure progress exists and is an array
                if (data.progress && Array.isArray(data.progress)) {
                  // Check if any progress entry for today meets the criteria
                  const isCompletedToday = data.progress.some(entry => 
                    isToday(entry.date) && entry.watching === 100 && entry.writing === 100
                  );
      
                  // console.log("isCompletedToday", isCompletedToday); // Log whether the progress is complete today
                  
                  // Find a matching video by id
                  const matchedVideo = allvideos.find(video => video.id === data.id);
                  // console.log(matchedVideo);
                  
                  // Return true if video is matched and lesson is completed today
                  return matchedVideo && isCompletedToday;
                }
                return false; // Skip documents without valid progress
              })
              .map(data => {
                // Find the matched video for each filtered lesson
                const matchedVideo = allvideos.find(video => video.id === data.id);
                return {
                  ...data,
                  title: matchedVideo ? matchedVideo.title : 'Unknown Title'
                };
              });
      
            console.log('Filtered completed today:', filteredLessons); // Shows the filtered documents with titles
            setCompletedToday(filteredLessons); // Save to state
          } catch (error) {
            console.error('Error fetching completed lessons:', error);
          }
        };
      
        fetchCompletedToday();
      }, [ isFocused]); // Add allvideos to dependency array if it's a state or prop
      
      

      const allvideos = tests.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue.videos);
      }, []);

      useEffect(() => {
        if (!allvideos.length) return;
      
        const fetchAttemptedToday = async () => {
          try {
            // Fetch all documents from the 'dayLesson' collection
            const q = query(collection(FIREBASE_DB, 'dayLesson'));
            const querySnapshot = await getDocs(q);
      
            // Extract document data and filter documents with progress entries today
            const filteredLessons = querySnapshot.docs
              .map(doc => doc.data()) // Extract document data
              .filter(data => {
                if (data.progress && Array.isArray(data.progress)) {
                  // Filter progress entries for today
                  const todaysEntries = data.progress.filter(entry => isToday(entry.date));
      
                  if (todaysEntries.length > 0) {
                    // Sort today's entries by date to get the latest entry
                    const latestEntry = todaysEntries.sort((a, b) => b.date - a.date)[0];
                    
                    // Find a matching video by id
                    const matchedVideo = allvideos.find(video => video.id === data.id);
                    
                    // Return true if video is matched and there are entries for today
                    if (matchedVideo) {
                      data.latestProgress = latestEntry; // Add latest progress entry to data
                      return true;
                    }
                  }
                }
                return false; // Skip documents without progress entries today
              })
              .map(data => {
                // Find the matched video for each filtered lesson
                const matchedVideo = allvideos.find(video => video.id === data.id);
                return {
                  ...data,
                  title: matchedVideo ? matchedVideo.title : 'Unknown Title',
                  watching: data.latestProgress.watching,
                  writing: data.latestProgress.writing
                };
              });
      
            console.log('Filtered attempted today:', filteredLessons); // Shows the filtered documents with titles and latest progress
            setCompletedToday(filteredLessons); // Save to state
          } catch (error) {
            console.error('Error fetching attempted lessons:', error);
          }
        };
      
        fetchAttemptedToday();
      }, [isFocused]); // Add allvideos to dependency array if it's a state or prop
      
      useEffect(() => {
        if (!allvideos.length) return;
      
        const fetchAttemptedThisWeek = async () => {
          try {
            // Fetch all documents from the 'dayLesson' collection
            const q = query(collection(FIREBASE_DB, 'dayLesson'));
            const querySnapshot = await getDocs(q);
      
            // Get start and end dates for the current week
            const startOfWeekDate = startOfWeek(currentWeekStartDate, { weekStartsOn: 1 });
            const endOfWeekDate = endOfWeek(currentWeekStartDate, { weekStartsOn: 1 });
      
            // Extract document data and filter documents with progress entries this week
            const filteredLessons = querySnapshot.docs
              .map(doc => doc.data()) // Extract document data
              .filter(data => {
                if (data.progress && Array.isArray(data.progress)) {
                  // Filter progress entries within the current week interval
                  const thisWeeksEntries = data.progress.filter(entry => 
                    isWithinInterval(new Date(entry.date.seconds * 1000 + entry.date.nanoseconds / 1000000), { start: startOfWeekDate, end: endOfWeekDate })
                  );
                  const todaysEntries = data.progress.filter(entry => isToday(entry.date));
                  console.log("today", todaysEntries);
      
                  if (thisWeeksEntries.length > 0) {
                    // Sort this week's entries by date to get the latest entry
                    const latestEntry = thisWeeksEntries.sort((a, b) => new Date(b.date.seconds * 1000) - new Date(a.date.seconds * 1000))[0];
      
                    // Find a matching video by id
                    const matchedVideo = allvideos.find(video => video.id === data.id);
      
                    // Return true if video is matched and there are entries for this week
                    if (matchedVideo) {
                      data.latestProgress = latestEntry; // Add latest progress entry to data
                      return true;
                    }
                  }
                }
                return false; // Skip documents without progress entries this week
              })
              .map(data => {
                // Find the matched video for each filtered lesson
                const matchedVideo = allvideos.find(video => video.id === data.id);
                return {
                  ...data,
                  title: matchedVideo ? matchedVideo.title : 'Unknown Title',
                  duration: matchedVideo ? matchedVideo.duration : 0,
                  watching: data.latestProgress.watching,
                  writing: data.latestProgress.writing,
                  date: data.latestProgress.date, // Include the date of the latest progress
                };
              });
      
            console.log('Filtered attempted this week:', filteredLessons); // Shows the filtered documents with titles and latest progress
            setFetchAttemptedThisWeek(filteredLessons); // Save to state
          } catch (error) {
            console.error('Error fetching attempted lessons this week:', error);
          }
        };
      
        fetchAttemptedThisWeek();
      }, [currentWeekStartDate, isFocused]); // Trigger fetch whenever the week changes or the component is focused
      

      const renderTitle = () => {
        return(
          <View >
          
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 24,
              backgroundColor: 'yellow',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  height: 12,
                  width: 12,
                  borderRadius: 6,
                  backgroundColor: '#407cff',
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  height: 20,
                  color: 'lightgray',
                }}>
                Watching
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  height: 12,
                  width: 12,
                  borderRadius: 6,
                  backgroundColor: '#fbb03b',
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  height: 20,
                  color: 'lightgray',
                }}>
                Writing
              </Text>
            </View>
          </View>
        </View>
        )
    }

      function renderItem({ item }) {
        // Safely find the matched document
        const matchedDoc = selectedDayLessonDocs?.find(doc => doc.data()?.id === item.id);
      
        // Safely log the data, only if matchedDoc is found
        if (matchedDoc) {
          // console.log(matchedDoc.data().progress); // Log the progress array
        }
      
        // Determine the highest progress for today
        let maxProgress = { watching: 0, writing: 0 };
        if (matchedDoc?.data()?.progress) {
          matchedDoc.data()?.progress.forEach(entry => {
            if (isToday(entry.date)) {
              maxProgress = {
                watching: Math.max(maxProgress.watching, entry.watching),
                writing: Math.max(maxProgress.writing, entry.writing),
              };
            }
          });
        }

        // console.log(matchedDoc.data())
        if (matchedDoc?.data()?.progress) {
          const { progress } = matchedDoc?.data();
    
          // Find the latest entry by sorting the progress array by date in descending order
          const latestProgress = progress.sort((a, b) => b.date.seconds - a.date.seconds)[0];
          
          // Reset the form values with the latest found values
          if (latestProgress) {
            maxProgress = {
              watching: latestProgress.watching || 0,
              writing: latestProgress.writing || 0,
            };
          } }
      
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
      const totalBars = 7;
      const totalSpaces = totalBars - 1;
      const spacingRatio = 29;
      const barWidthRatio = 8;
    
      const screenWidth = width - 32;
    
      // Calculate total width taken up by bars and spaces
      const totalWidthRatio =
        totalBars * barWidthRatio + totalSpaces * spacingRatio;
    
      // Calculate the width of each bar and each space
      const barWidth = (screenWidth * barWidthRatio) / totalWidthRatio;
      const spaceWidth = (screenWidth * spacingRatio) / totalWidthRatio;
          

    return (
        <View style={{ flex:1 }}>
          <View
          style={{
            backgroundColor: '#ffffff',
            paddingBottom: 40,
            borderRadius: 10,
            paddingTop: 60,
          }}>
              <View style={styles.header}>
              <TouchableOpacity  onPress={goToPreviousWeek} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                <FontAwesome6 name="angle-left" size={18} color="#98c14b" />
              </TouchableOpacity>
              <Text style={styles.dateText}>
                {formattedStartDate} - {formattedEndDate}
              </Text>
              <TouchableOpacity onPress={goToNextWeek} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                <FontAwesome6 name="angle-right" size={18} color="#98c14b" />
              </TouchableOpacity>
            </View>
    
        <View style={{ }}>
          {renderTitle()}
          <View style={{  paddingTop: 24, alignSelf: "center",marginLeft: -10,}}>
              <BarChart
                      width={width}
                      spacing={29}
                    barWidth={8}

                data={barData}
                roundedTop
                roundedBottom
                // hideRules
                hideYAxisText
              yAxisThickness={0}
                xAxisThickness={0}
                yAxisThickness={0}
                // yAxisTextStyle={{color: 'gray'}}
                noOfSections={4}
                maxValue={100}
                isAnimated
                endSpacing={0}
                xAxisLabelTextStyle={{color: 'lightgray', textAlign: 'center'}}
  
              />
            </View>
        </View>
          
        </View>
        <View style={{ paddingHorizontal:12, paddingTop: 24, paddingBottom: 120 }}>
        <FlatList
                data={fetchAttemptedThisWeek}

            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            // ref={flatListRef}
            // simultaneousHandlers={panRef}
            renderItem={renderItem}
          />
        </View>
        <View style={{ paddingHorizontal:12, paddingBottom: 120 }}>
        </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      paddingHorizontal: 20,
      backgroundColor: "#ffffff",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    dateText: {
      fontSize: 12,
      textTransform: "uppercase",
    },
    dailyAverageContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    chartContainer: {
      // backgroundColor: "yellow",
    },
    chartWrapper: {
      // backgroundColor: "red",
      // opacity: 0.2,
      marginLeft: -10,
    },
    separator: {
      height: 0.5,
      width: "100%",
      backgroundColor: "#ffffff",
      marginTop: 4,
      marginBottom: 14,
    },
    meals: {
      marginTop: 16,
    },
    mealContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      // backgroundColor: "red",
      paddingTop: 8,
      paddingBottom: 8,
      borderTopWidth: 0.5,
      borderTopColor: "#c8c8c8",
    },
    mealIconAndText: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      // backgroundColor: "blue",
      flex: 3,
    },
    mealPercentageAndCalories: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 2,
    },
    mealIcon: {
      borderRadius: 8,
      width: 8,
      height: 8,
      // backgroundColor: "green",
    },
    breakFast: {
      backgroundColor: "#98c14b",
    },
    lunch: {
      backgroundColor: "#e3dc49",
    },
    dinner: {
      backgroundColor: "#e2b953",
    },
    other: {
      backgroundColor: "#b6b5da",
    },
  
    mealCalories: {
      color: "#98c14b",
      // backgroundColor: "pink",
    },
    eatenFood: {
      backgroundColor: "#98c14b",
      position: "absolute",
      top: 60,
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: 80,
      paddingHorizontal: 20,
    },
    eatenFoodTitle: {
      fontSize: 24,
      color: "white",
      fontWeight: "600",
      marginBottom: 12,
    },
    eatenFoodTable: {
      // backgroundColor: "red",
    },
    eatenFoodTableHeader: {
      color: "white",
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingImage: {
      marginTop: 30,
      width: 64,
      height: 64,
    },
    loadingOpacity: {
      opacity: 0.5,
    },
  });
  

export default GroupedBars;