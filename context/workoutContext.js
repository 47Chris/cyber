import { createContext, useContext, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../firebaseConfig";

const WorkoutContext = createContext();

export const useWorkout = () => useContext(WorkoutContext);

export const WorkoutProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [days, setDays] = useState([]);

  const fetchRoutine = async (routineId) => {
    try {
      setLoading(true);
      const routineRef = doc(FIREBASE_DB, "routines", routineId);
      const routineDoc = await getDoc(routineRef);

      if (routineDoc.exists()) {
        const routineData = routineDoc.data();
        setRoutine(routineData);

        const daysRef = collection(routineRef, "days");
        const daysSnapshot = await getDocs(daysRef);
        if (!daysSnapshot.empty) {
          const fetchedDays = [];

          for (const dayDoc of daysSnapshot.docs) {
            const dayData = dayDoc.data();
            const exercises = [];

            // Check if dayData exists and has an exercises array
            if (dayData && Array.isArray(dayData.exercises)) {
              for (const exerciseId of dayData.exercises) {
                const exerciseRef = doc(FIREBASE_DB, "exercises", exerciseId);
                const exerciseDoc = await getDoc(exerciseRef);
                if (exerciseDoc.exists()) {
                  exercises.push({
                    id: exerciseDoc.id,
                    ...exerciseDoc.data(),
                  });
                } else {
                  console.log(`No such exercise with ID: ${exerciseId}`);
                }
              }
            }

            fetchedDays.push({ id: dayDoc.id, ...dayData, exercises });
          }

          // Define the order of days from Monday to Sunday
          const dayOrder = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ];

          const normalizeDay = (day) =>
            day.trim().charAt(0).toUpperCase() + day.slice(1).toLowerCase();

          fetchedDays.sort(
            (a, b) =>
              dayOrder.indexOf(normalizeDay(a.day)) -
              dayOrder.indexOf(normalizeDay(b.day))
          );

          setDays(fetchedDays);
        } else {
          console.log("No days found for this routine");
        }
      } else {
        console.log("No such routine!");
      }
    } catch (error) {
      console.error("Error fetching routine: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkoutContext.Provider value={{ fetchRoutine, loading, days, routine }}>
      {children}
    </WorkoutContext.Provider>
  );
};
