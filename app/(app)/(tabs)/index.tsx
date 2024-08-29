import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import TextView from '@/components/TextView';
// import HeaderWrap from '@/components/HeaderWrap';
// import LogoImage from '@/assets/images/logo.png';
// import BellImage from '@/assets/images/bell.png';
// import HandIcon from '@/assets/images/hand.png';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { AppTheme } from '@/utils/appConstant';
import Task from '@/components/Task';
import { navigate } from '@/navigators/NavigationServices';
import RouteName from '@/navigators/RouteName';
import TouchableDebounce from '@/components/TouchableDebounce';
import AppwriteContext from '@/utils/appwrite/AppwriteContext';
// import { useToast } from 'react-native-toast-notifications';
import Config from 'react-native-config';
import { Query } from 'appwrite';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';
import { serverTimestamp } from "firebase/firestore";

const TASK_COLLECTION_ID = Config.TASK_COLLECTION_ID;
const DATABASE_ID = Config.DATABASE_ID;

const Home = () => {
//   const { appwrite } = useContext(AppwriteContext);
//   const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentDayProgress, setCurrentDayProgress] = useState(70);
  const [selectedDayLessonDocs, setSelectedDayLessonDocs] = useState(null);
  const [dayLesson, setDayLesson] = useState(0)

  const [priceActionFundementals, setPriceActionFundementals] = useState([])
  
  const isFocused = useIsFocused();
  
  useEffect(() => {
    const fetchPriceActionFundementals = async () => {
      const priceActionFundementalsSnapshot = await getDocs(collection(FIREBASE_DB, "priceActionFundementals"));
      const fetchedPriceActionFundementals = [];
      priceActionFundementalsSnapshot.forEach((doc) => {
        fetchedPriceActionFundementals.push({ id: doc.id, ...doc.data() });
      });
      setPriceActionFundementals(fetchedPriceActionFundementals);
      // console.log(fetchedPriceActionFundementals.videos);
      console.log("Number of documents in priceActionFundementals collection: ", priceActionFundementalsSnapshot.size);
    };

    fetchPriceActionFundementals();
  }, []);

  useEffect(() => {
    const fetchDayLessons = async () => {
      const dayLessonCol = collection(FIREBASE_DB, "dayLesson");
  
      // Create a query to fetch documents where watching and writing both equal 100
      const q = query(dayLessonCol, where("watching", "==", 100), where("writing", "==", 100));
      
      // Execute the query
      const dayLessonSnapshot = await getDocs(q);
  
      console.log("Number of documents in dayLesson collection with watching and writing equal to 100: ", dayLessonSnapshot.size);
      
      setDayLesson(dayLessonSnapshot.size);
    };
    fetchDayLessons();
  }, [isFocused]);

   const allvideos = priceActionFundementals.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue.videos);
    }, []);
  
    console.log(
      dayLesson/allvideos.length * 100
    );
    
  useEffect(() => {// Set the progress to state
    const allvideos = priceActionFundementals.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue.videos);
    }, []);
    const progress = dayLesson > 0 ? dayLesson/allvideos.length * 100 : 0;
    setCurrentDayProgress(Math.round(progress));
    console.log(currentDayProgress);
    

  }, [allvideos.length, dayLesson])
  

  


  async function submitData() {
    const data = {
      videos: [
        // Getting Started (01-07)
        { id: "01", watching: 100, writing: 100 },
        { id: "02A", watching: 100, writing: 100 },
        { id: "02B", watching: 100, writing: 100 },
        { id: "02C", watching: 100, writing: 100 },
        { id: "02D", watching: 100, writing: 100 },
        { id: "03A", watching: 100, writing: 100 },
        { id: "03B", watching: 100, writing: 100 },
        { id: "03C", watching: 100, writing: 100 },
        { id: "03D", watching: 100, writing: 100 },
        { id: "03E", watching: 100, writing: 100 },
        { id: "04", watching: 100, writing: 100 },
        { id: "05", watching: 100, writing: 100 },
        { id: "06", watching: 100, writing: 100 },
        { id: "07A", watching: 100, writing: 100 },
        { id: "07B", watching: 100, writing: 100 },
    
        // Charting Analysis (08-11)
        { id: "08A", watching: 100, writing: 100 },
        { id: "08B", watching: 100, writing: 100 },
        { id: "08C", watching: 100, writing: 100 },
        { id: "08D", watching: 100, writing: 100 },
        { id: "09A", watching: 100, writing: 100 },
        { id: "09B", watching: 100, writing: 100 },
        { id: "09C", watching: 100, writing: 100 },
        { id: "10A", watching: 100, writing: 100 },
        { id: "10B", watching: 100, writing: 100 },
        { id: "11A", watching: 100, writing: 100 },
        { id: "11B", watching: 100, writing: 100 },
    
        // Market Cycle (12-18)
        { id: "12A", watching: 100, writing: 100 },
        { id: "12B", watching: 100, writing: 100 },
        { id: "12C", watching: 100, writing: 100 },
        { id: "13A", watching: 100, writing: 100 },
        { id: "13B", watching: 100, writing: 100 },
        { id: "13C", watching: 100, writing: 100 },
        { id: "14A", watching: 100, writing: 100 },
        { id: "14B", watching: 100, writing: 100 },
        { id: "14C", watching: 100, writing: 100 },
        { id: "14D", watching: 100, writing: 100 },
        { id: "14E", watching: 100, writing: 100 },
        { id: "15A", watching: 100, writing: 100 },
        { id: "15B", watching: 100, writing: 100 },
        { id: "15C", watching: 100, writing: 100 },
        { id: "15D", watching: 100, writing: 100 },
        { id: "15E", watching: 100, writing: 100 },
        { id: "15F", watching: 100, writing: 100 },
        { id: "15G", watching: 100, writing: 100 },
        { id: "16A", watching: 100, writing: 100 },
        { id: "16B", watching: 100, writing: 100 },
        { id: "16C", watching: 100, writing: 100 },
        { id: "16D", watching: 100, writing: 100 },
        { id: "16E", watching: 100, writing: 100 },
        { id: "17A", watching: 100, writing: 100 },
        { id: "17B", watching: 100, writing: 100 },
        { id: "18A", watching: 100, writing: 100 },
        { id: "18B", watching: 100, writing: 100 },
        { id: "18C", watching: 100, writing: 100 },
        { id: "18D", watching: 100, writing: 100 },
        { id: "18E", watching: 100, writing: 100 },
        { id: "18F", watching: 100, writing: 100 }
      ]
    };
    
    async function addVideosToFirestore() {
      const dayLessonCollection = collection(FIREBASE_DB, "dayLesson");
    
      for (const video of data.videos) {
        await addDoc(dayLessonCollection, video);
      }
    
      console.log("All videos added successfully!");
    }
    // addVideosToFirestore().catch(console.error);
  }
  useEffect(() => {
    // submitData().catch(console.error);
  }, []);

const date = new Date();
          const hour = date.getHours();
          let greet = '';
          if (hour < 12) {
            greet = 'Morning';
          } else if (hour < 17) {
            greet = 'Afternoon';
          } else {
            greet = 'Evening';
          }


// Function to rename a document
const renameDocument = async (oldDocId, newDocId, collectionName) => {
  try {
    // Reference to the old document
    const oldDocRef = doc(FIREBASE_DB, collectionName, oldDocId);

    // Get the data from the old document
    const oldDocSnap = await getDoc(oldDocRef);
    
    if (oldDocSnap.exists()) {
      // Data from the old document
      const data = oldDocSnap.data();

      // Reference to the new document
      const newDocRef = doc(FIREBASE_DB, collectionName, newDocId);

      // Write the data to the new document
      await setDoc(newDocRef, data);

      // Delete the old document
      await deleteDoc(oldDocRef);

      console.log('Document renamed successfully');
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.error('Error renaming document: ', error);
  }
};

renameDocument('How_to_Trade_Prerequisites_30_36', '5.How_to_Trade_Prerequisites_30_36', 'priceActionFundementals');


  return (
    <View style={styles.container}>
      <View showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrapper}>
          
          <TextView style={styles.homeTitle}>{greet}, Chris</TextView>
          <Image
            // source={HandIcon}
            style={{
              width: 30,
              height: 30,
            }}
          />
        </View>

        <View style={styles.progressWrapper}>
          <AnimatedCircularProgress
            size={80}
            width={10}
            fill={currentDayProgress}
            tintColor="#ff6569"
            backgroundColor="#eee"
          >
            {fill => (
              <Text style={{ fontWeight: 600 }}>{currentDayProgress}%</Text>
            )}
          </AnimatedCircularProgress>
          <View>
            <TextView style={styles.processTitle}>
              {currentDayProgress < 20
                ? 'Let\'s get going'
                : currentDayProgress < 40
                ? 'You\'re doing great'
                : currentDayProgress < 60
                ? 'Almost there'
                : currentDayProgress < 80
                ? 'You\'re doing awesome'
                : 'Well done'}
            </TextView>
            <TextView style={styles.processText}>{dayLesson} of {allvideos.length} completed!</TextView>
          </View>
        </View>

        <View style={styles.taskTextWrapper}>
          <TextView
            style={{
              fontWeight: 600,
              fontSize: AppTheme.fontSize.s16,
            }}
          >
            Today Task (16)
          </TextView>
          <TouchableDebounce >
            <TextView
              style={{
                color: '#ff6569',
                fontWeight: 700,
              }}
            >
              See All
            </TextView>
          </TouchableDebounce>
        </View>

        <View style={{  backgroundColor: "white", padding: 12, flexDirection: "row", gap: 12, alignItems: "center", justifyContent: "space-between", borderRadius: 16, marginTop:20}}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Image
            source={require('@/assets/images/task/candlestick-chart.png')}
            style={{ width: 40, height: 40 }}
          />
            <View style={{ gap:4 }}>
              <Text style={{ color: "#333333" }}>Learning Trading</Text>
              <Text style={{ color: "#333333" }}>50 minutes</Text>
            </View>
          </View>
          <View style={{ width: 16, height: 16, backgroundColor: "grey", borderRadius: 16 }}></View>
        </View>

        <FlatList
          style={{ marginTop: 10, height: '100%' }}
          refreshing={refreshing}
        //   onRefresh={onRefresh}
          data={tasks}
          renderItem={({ item }) => <Task item={item} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 15,
    backgroundColor: "#f3f3f3",
  },
  headerIconLeft: {
    width: 60,
    height: 60,
  },
  headerIconRight: {
    width: 30,
    height: 30,
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
    fontSize: AppTheme.fontSize.s24,
    fontWeight: 600,
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
  },
  processTitle: {
    fontWeight: 600,
    fontSize: AppTheme.fontSize.s16,
    marginBottom: 10,
  },

  processText: {
    fontSize: AppTheme.fontSize.s12,
  },

  taskTextWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});


export default Home;
