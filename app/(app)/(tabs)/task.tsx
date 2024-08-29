/**
 * Sample React Native Calendar Strip
 * https://github.com/BugiDev/react-native-calendar-strip
 * @flow
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, Button, Image, Pressable, FlatList, ActivityIndicator } from 'react-native';
import CalendarStrip from '@/components/CalendarStrip';
import moment from 'moment';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import SliderComp from '@/components/SliderComp';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Config from 'react-native-config';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AppTheme } from '@/utils/appConstant';
import TextView from '@/components/TextView';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
const TASK_COLLECTION_ID = Config.TASK_COLLECTION_ID;
const CATEGORY_COLLECTION_ID = Config.CATEGORY_COLLECTION_ID;
const DATABASE_ID = Config.DATABASE_ID;

const validateSchema = yup.object().shape({
  watching: yup.number().required('Watching is required').min(0),
  writing: yup.number().required('Writing is required').min(0),
});
const App = () => {
  const isFocused = useIsFocused();
  
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [formattedDate, setFormattedDate] = useState('');
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

  const [cancelButtonText, setCancelButtonText] = useState('Cancel');
    const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(true);
  

  // useEffect(() => {
  //   let customDatesStyles = [];
  //   let markedDates = [];
  //   let startDate = moment(); // today

  //   // Create a week's worth of custom date styles and marked dates.
  //   for (let i=0; i<7; i++) {
  //     let date = startDate.clone().add(i, 'days');

  //     customDatesStyles.push({
  //       startDate: date, // Single date since no endDate provided
  //       dateNameStyle: {color: 'blue'},
  //       dateNumberStyle: {color: 'purple'},
  //       highlightDateNameStyle: {color: 'pink'},
  //       highlightDateNumberStyle: {color: 'yellow'},
  //       // Random color...
  //       dateContainerStyle: { backgroundColor: `#${(`#00000${(Math.random() * (1 << 24) | 0).toString(16)}`).slice(-6)}` },
  //     });

  //     let dots = [];
  //     let lines = [];

  //     if (i % 2) {
  //       lines.push({
  //         color: 'cyan',
  //         selectedColor: 'orange',
  //       });
  //     }
  //     else {
  //       dots.push({
  //         color: 'red',
  //         selectedColor: 'yellow',
  //       });
  //     }
  //     markedDates.push({
  //       date,
  //       dots,
  //       lines
  //     });
  //   }

  //   setCustomDatesStyles(customDatesStyles);
  //   setMarkedDates(markedDates);
  //   setStartDate(startDate);
  // }, []);

  const datesBlacklistFunc = date => {
    return date.isoWeekday() === 6; // disable Saturdays
  }

  const onDateSelected = selectedDate => {
    setSelectedDate(selectedDate);
    setFormattedDate(selectedDate.format('YYYY-MM-DD'));
  }

  const setSelectedDateNextWeek = date => {
    const selectedDate = moment(selectedDate).add(1, 'week');
    const formattedDate = selectedDate.format('YYYY-MM-DD');
    setSelectedDate(selectedDate);
    setFormattedDate(formattedDate);
  }

  const setSelectedDatePrevWeek = date => {
    const selectedDate = moment(selectedDate).subtract(1, 'week');
    const formattedDate = selectedDate.format('YYYY-MM-DD');
    setSelectedDate(selectedDate);
    setFormattedDate(formattedDate);
  }

  const snapPoints = useMemo(() => ['25%', '50%', ], [])

  const bottomSheetRef = useRef(null);

  const [selectedSection, setSelectedSection] = useState(null)

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setSelectedSection(null);
    setValue('writing', 0);
    setValue('watching', 0);
    setIsSaveButtonVisible(false);
        setCancelButtonText('Close');
  };
  const handleOpenPress = (item: object) => {
    setSelectedSection(item);
    bottomSheetRef.current?.expand();
    (async () => {
      const selectedDayLesson = await getDocs(collection(FIREBASE_DB, "dayLesson"));
      const selectedDayLessonDoc = selectedDayLesson.docs.find(doc => doc.data().id === item.id);
      if (selectedDayLessonDoc) {
        const { writing, watching } = selectedDayLessonDoc.data();
        reset({ writing, watching });
      } else {
        reset({ writing: 0, watching: 0 });
      }
    })();
    
  };

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props}  onPress={() => {setIsSaveButtonVisible(false);
        setCancelButtonText('Close');}}/>
    ),
    []
  );
  
  

  async function submitData() {
    const data = {
      totalVideos: 15,
      totalDuration: "5hr 42min",
      videos: [
        { id: "01", title: "Terminology", duration: "33:41" },
        { id: "02A", title: "Chart Basics and Price Action", topics: ["Charts: Purpose and types", "Markets: How they work"], duration: "29:17" },
        { id: "02B", title: "Chart Basics and Price Action", topics: ["Volume", "News"], duration: "32:28" },
        { id: "02C", title: "Chart Basics and Price Action", topics: ["What is price action", "What is the pain trade"], duration: "24:26" },
        { id: "02D", title: "Chart Basics and Price Action", topics: ["Candlestick Patterns", "What traders talk about", "Indicators"], duration: "28:30" },
        { id: "03A", title: "Forex Basics", topics: ["What is the Forex Market", "Forex Sessions", "Leverage, Fundamentals"], duration: "17:37" },
        { id: "03B", title: "Forex Basics", topics: ["Risks, costs, brokers", "Symbols", "Types of quotes"], duration: "15:24" },
        { id: "03C", title: "Forex Basics", topics: ["Value of a pip", "Forex Workspaces", "Futures or forex?"], duration: "14:04" },
        { id: "03D", title: "Forex Basics", topics: ["Charts only approximate", "Best time frames", "Scalps and Swing Trades"], duration: "16:47" },
        { id: "03E", title: "Forex Basics", topics: ["Margins", "Profit and Loss"], duration: "10:50" },
        { id: "04", title: "My Setup", duration: "6:57" },
        { id: "05", title: "Program Trading", topics: ["What is program trading", "High-frequency trading", "Spoofing", "Front Running & HFT"], duration: "32:10" },
        { id: "06", title: "Personality Traits of Successful Traders", topics: ["Traits of Great Traders", "Doing stupid things", "Comfortable with uncertainty"], duration: "26:30" },
        { id: "07A", title: "Starting Out", topics: ["False Beliefs", "What is the big picture? BLSHS!", "Chart types, time frames"], duration: "34:44" },
        { id: "07B", title: "Starting Out", topics: ["Starting out and advancing", "Emotions", "Fear and greed", "Uncertainty"], duration: "18:46" }
      ]
    };
  
    // Reference to your Firestore collection and document
    await setDoc(doc(FIREBASE_DB, "priceActionFundementals", "Support_Resistance_and_Basic_Patterns_19_29"), data);
    console.log("Data submitted successfully!");
  }
  
  // submitData().catch(console.error);
  
  



  const [tests, setTests] = useState([])
  

  
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

  // const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (loading) return;
    setLoading(true);
    
    const currentDate = new Date(); // Get the current date
    const values = { ...getValues() };
    console.log(values);
    
    const allvideos = tests.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue.videos);
    }, []);
    
    const selectedVideo = allvideos.find((video) => video.id === selectedSection.id) || null;  
    console.log("selectedVideo", selectedVideo);
    
    const selectedDayLesson = await getDocs(collection(FIREBASE_DB, "dayLesson"));
    const selectedDayLessonDoc = selectedDayLesson.docs.find(doc => {
      console.log("dayLesson doc id: ", doc.id);
      return doc.data().id === selectedVideo?.id;
    });
    console.log(selectedDayLessonDoc?.id);
    
    try {
      if (selectedDayLessonDoc?.id !== undefined) {
        await updateDoc(doc(FIREBASE_DB, "dayLesson", selectedDayLessonDoc.id), {
          watching: values.watching,
          writing: values.writing,
          dateSubmitted: currentDate, // Add the current date
        });
      } else {
        await addDoc(collection(FIREBASE_DB, "dayLesson"), {
          id: selectedSection.id,
          watching: values.watching,
          writing: values.writing,
          dateSubmitted: currentDate, // Add the current date
        });
      }
      
      toast.show('Saved', {
        type: 'success',
        duration: 4000, 
        animationType: 'zoom-in', 
        placement: 'top', 
        textStyle: { color: '#ffffff', fontSize: 8, textAlign: 'center' },
        style: { 
          backgroundColor: '#28a745', 
          padding: 0,
          borderRadius: 20, 
          width: '100%', 
          height: 34,
          justifyContent: 'center', 
          alignItems: 'center', 
          marginTop: 20
        }, 
      });
    } catch (error) {
      toast.show('Connection error', { type: 'error' });
      console.error("Error adding lesson: ", error);
    } finally {
      setLoading(false);
      setCancelButtonText('Close');
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
  
  const values = { ...getValues() }
  useEffect(() => {
    const fetchDayLessons = async () => {
      const selectedDayLesson = await getDocs(collection(FIREBASE_DB, "dayLesson"));
      setSelectedDayLessonDocs(selectedDayLesson.docs);
    };
    fetchDayLessons();
  }, [values.watching, values.writing]);


  function renderItem({ item }) {
    // Safely find the matched document
  const matchedDoc = selectedDayLessonDocs?.find(doc => doc.data()?.id === item.id);

  // Safely log the data, only if matchedDoc is found
  if (matchedDoc) {
    console.log(matchedDoc.data()?.writing, matchedDoc.data()?.watching);
  }

    
    
    return (
      
      <TouchableOpacity onPress={()=> handleOpenPress(item)} style={{  backgroundColor: "white", padding: 12, flexDirection: "row", gap: 12, alignItems: "center", justifyContent: "space-between", borderRadius: 16, }} >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <View style={{ width: 16, height: 16, borderColor: "grey", borderWidth:1, borderRadius: 16 }}></View>

        <View style={{ gap:4 }}>
          <Text style={{ color: "#333333", fontWeight: 700, textDecorationLine: matchedDoc?.data()?.writing === 100 && matchedDoc?.data()?.watching === 100 ? "line-through" : "none", }}>{item.id} {item.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="eye" size={12} color="grey" />
              <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>{matchedDoc?.data()?.watching || 0}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: 8 }}>
            <Ionicons name="create-sharp" size={12} color="grey" />
              <Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>{matchedDoc?.data()?.writing || 0}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{  }}><Text style={{ color: "grey", fontSize: 12, marginLeft: 2 }}>{item.duration}</Text></View>
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
const groupIds = Array.from(new Set(allvideos.map(video => video.id.split(/(?<=\d)\D/)[0])));

// Check if all videos in a group are complete
const isGroupComplete = (groupId) => {
  const groupVideos = allvideos.filter(video => video.id.startsWith(groupId));
  return groupVideos.every(video => {
    const dayLessonDoc = selectedDayLessonDocs?.find(doc => doc.data()?.id === video.id);
    return dayLessonDoc && dayLessonDoc.data()?.watching === 100 && dayLessonDoc.data()?.writing === 100;
  });
};

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
const filteredVideos = allvideos.filter(video => video.id.startsWith(currentGroupId));


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
      const q = query(collection(FIREBASE_DB, 'dayLesson'));
      const querySnapshot = await getDocs(q);

      console.log('Total documents fetched:', querySnapshot.size); // Shows the number of documents fetched

      // Extract document data and filter documents that were completed today
      const filteredLessons = querySnapshot.docs
        .map(doc => doc.data()) // Extract document data
        .filter(data => {
          console.log('Document data:', data); // Log each document's data

          // Ensure dateSubmitted exists and is a valid Firestore Timestamp
          if (data.dateSubmitted && data.dateSubmitted.seconds) {
            // Find a matching video by id
            const matchedVideo = allvideos.find(video => video.id === data.id);
            console.log(matchedVideo);
            
            // Return true if video is matched and lesson is completed today
            return matchedVideo && data.watching === 100 && data.writing === 100 && isToday(data.dateSubmitted);
          }
          return false; // Skip documents without a valid dateSubmitted
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
}, [isFocused]); // Add allvideos to dependency array if it's a state or prop


  return (
    <View style={{
      flex: 1,
      
      // paddingHorizontal: 20,
      backgroundColor: "#f3f3f3",
    }}>
      <CalendarStrip
        scrollable
        calendarAnimation={{type: 'sequence', duration: 30}}
        daySelectionAnimation={{type: 'background', duration: 300, highlightColor: '#9265DC'}}
        style={{height:150, paddingTop: 64, paddingBottom: 10, paddingHorizontal: 12}}
        calendarHeaderStyle={{color: 'white'}}
        calendarColor={'#3b76c3'}
        dateNumberStyle={{color: 'white'}}
        dateNameStyle={{color: 'white'}}
        iconContainer={{flex: 0.1}}
        customDatesStyles={customDatesStyles}
        highlightDateNameStyle={{color: '#3b76c3'}}
        highlightDateNumberStyle={{color: '#3b76c3'}}
        highlightDateContainerStyle={{backgroundColor: 'white', borderRadius: 40}}
        markedDates={markedDates}
        // datesBlacklist={datesBlacklistFunc}
        selectedDate={selectedDate}
        onDateSelected={onDateSelected}
        useIsoWeekday={false}

      />
     <View style={{ flexDirection: 'row', marginVertical:20, gap:12, paddingHorizontal: 12 }}>
        <View style={{  paddingVertical: 8, paddingHorizontal: 24, backgroundColor: "#3b76c3", borderRadius: 16 }}>
              <Text style={{ }}>All</Text>
            </View>
        <View style={{ }}>
              <Text style={{ paddingVertical: 8, paddingHorizontal: 24, borderWidth: 1, borderColor: "#3b76c3", borderRadius: 16  }}>Work</Text>
            </View>
     </View>

      {/* <Text style={{fontSize: 24}}>Selected Date: {formattedDate}</Text> */}
      <View style={{ paddingHorizontal: 12 }}>
            
      </View>

      <View style={{ paddingHorizontal:12 }}>
        <FlatList
                data={filteredVideos}

            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            // ref={flatListRef}
            // simultaneousHandlers={panRef}
            renderItem={renderItem}
          />
      </View>
      <View style={{ flexDirection: 'row', marginVertical:20, paddingHorizontal: 12 }}>
        <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: showCompleted ? '#3b76c3' : 'black' }}>Hide completed tasks</Text>
          </View>
        </TouchableOpacity>
      </View>
      {showCompleted && <View style={{ paddingHorizontal:12 }}>
        <FlatList
                data={completedToday}

            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={ItemSeparatorView}
            // ref={flatListRef}
            // simultaneousHandlers={panRef}
            renderItem={renderItem}
          />
      </View>}

      <BottomSheet
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        snapPoints={snapPoints}
        index={0}
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        style={{ elevation:5 }}
      >
        <View style={{ padding: 20 }}>
           {/* <Button
              title="Close" onPress={handleClosePress}
            /> */}
          <Text style={{color: "#333333", fontWeight: 700, marginBottom: 4}}>{selectedSection?.id} {selectedSection?.title}</Text>
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
            value={getValues('watching')}
            control={control}
            onChange={value => {
              setValue('watching', value);
              setTrigger(prev => prev + 1);
              setIsSaveButtonVisible(true);
        setCancelButtonText('Cancel');
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
            value={getValues('writing')}
            control={control}
            onChange={value => {
              setValue('writing', value);
              setTrigger(prev => prev + 1);
              setIsSaveButtonVisible(true);
        setCancelButtonText('Cancel');
            }}
            errorMessage={errors?.writing?.message}
          />
        </View>
         
          <View style={{ }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 16 }}>
             
              {isSaveButtonVisible && <Pressable
                style={{
                  backgroundColor:"#3b76c3",
                  padding: 8,
                  borderRadius: 24,
                  paddingVertical: 12,
 
                }}
                onPress={() => {
                  submit();
                }}
                disabled={loading}
              >
                {loading ? (<ActivityIndicator size={24} color={"white"} />) : (<TextView style={{ color: "white", textAlign: "center" }}>Save</TextView>)}
              </Pressable>}
              <Pressable
                style={{
                  // backgroundColor: AppTheme.colors.neutral_30,
                  paddingVertical: 12,
                }}
                onPress={() => handleClosePress()}
              >
                <TextView style={{ color:"#3b76c3", textAlign: "center", fontWeight: "500" }}>{cancelButtonText}</TextView>
              </Pressable>
            </View>
          </View>
        </View>
      </BottomSheet>

    </View>
  );
};

export default App;
