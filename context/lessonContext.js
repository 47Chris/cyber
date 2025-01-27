import { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../firebaseConfig";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useIsFocused } from "@react-navigation/native";

const LessonContext = createContext();

const validateSchema = yup.object().shape({
  watching: yup.number().required("Watching is required").min(0),
  writing: yup.number().required("Writing is required").min(0),
});

export const useLesson = () => useContext(LessonContext);

export const LessonProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const [cancelButtonText, setCancelButtonText] = useState("Cancel");
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(true);
  const [tests, setTests] = useState([]);

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

  return (
    <LessonContext.Provider value={{ submit, loading }}>
      {children}
    </LessonContext.Provider>
  );
};
