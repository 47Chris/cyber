import React, { useRef, useEffect, useCallback, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import SliderComp from "@/components/SliderComp";
import LessonList from "@/components/LessonList";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/firebaseConfig";

const validateSchema = yup.object().shape({
  watching: yup.number().required("Watching is required").min(0),
  writing: yup.number().required("Writing is required").min(0),
});

const BottomSheetComponent = ({
  lessons,
  selectedSection,
  setSelectedSection,
  isSaveButtonVisible,
  setIsSaveButtonVisible,
  cancelButtonText,
  setCancelButtonText,
  toast,
  fetchDayLessons,
  setLoading,
  loading,
}) => {
  const bottomSheetRef = useRef(null);
  const {
    reset,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { writing: 0, watching: 0 },
    resolver: yupResolver(validateSchema),
  });

  const handleOpenPress = async (item) => {
    setSelectedSection(item);
    bottomSheetRef.current?.expand();

    const selectedDayLesson = await getDocs(
      collection(FIREBASE_DB, "dayLesson")
    );
    const selectedDayLessonDoc = selectedDayLesson.docs.find(
      (doc) => doc.data().id === item.id
    );

    if (selectedDayLessonDoc) {
      const { writing, watching } = selectedDayLessonDoc.data();
      reset({ writing, watching });
    } else {
      reset({ writing: 0, watching: 0 });
    }
  };

  const handleClosePress = () => {
    bottomSheetRef.current?.close();
    setSelectedSection(null);
    setValue("writing", 0);
    setValue("watching", 0);
    setIsSaveButtonVisible(false);
    setCancelButtonText("Close");
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={handleClosePress}
      />
    ),
    []
  );

  const submit = async () => {
    const currentDate = new Date();
    const { writing, watching } = getValues();
    setLoading(true);

    try {
      const selectedDayLesson = await getDocs(
        collection(FIREBASE_DB, "dayLesson")
      );
      const selectedDayLessonDoc = selectedDayLesson.docs.find(
        (doc) => doc.data().id === selectedSection.id
      );

      if (selectedDayLessonDoc) {
        const docRef = doc(FIREBASE_DB, "dayLesson", selectedDayLessonDoc.id);
        await updateDoc(docRef, { writing, watching, dateSaved: currentDate });
      } else {
        await addDoc(collection(FIREBASE_DB, "dayLesson"), {
          id: selectedSection.id,
          writing,
          watching,
          dateSaved: currentDate,
        });
      }

      fetchDayLessons();
      toast.show("Lesson saved successfully.", { type: "success" });
      handleClosePress();
    } catch (error) {
      console.error(error);
      toast.show("Failed to save lesson.", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const snapPoints = ["25%", "50%"];

  return (
    <>
      {/* <LessonList lessons={lessons} handleOpenPress={handleOpenPress} /> */}

      {/* <BottomSheet
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        snapPoints={snapPoints}
        index={0}
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        style={{ elevation: 5 }}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#333333", fontWeight: 700, marginBottom: 4 }}>
            {selectedSection?.id} {selectedSection?.title}
          </Text>
          {selectedSection?.topics?.map((topic, index) => (
            <Text key={index}>{topic}</Text>
          ))}
          <View style={{ marginTop: 20, height: 40 }}>
            <SliderComp
              title="Watching"
              minimumValue={0}
              maximumValue={100}
              fieldName="watching"
              value={getValues("watching")}
              control={control}
              onChange={(value) => {
                setValue("watching", value);
                setIsSaveButtonVisible(true);
                setCancelButtonText("Cancel");
              }}
              errorMessage={errors?.sessions?.message}
            />
          </View>
          <View style={{ marginTop: 20, marginBottom: 20, height: 40 }}>
            <SliderComp
              title="Writing"
              minimumValue={0}
              maximumValue={100}
              fieldName="writing"
              value={getValues("writing")}
              control={control}
              onChange={(value) => {
                setValue("writing", value);
                setIsSaveButtonVisible(true);
                setCancelButtonText("Cancel");
              }}
              errorMessage={errors?.writing?.message}
            />
          </View>
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
                onPress={submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size={24} color={"white"} />
                ) : (
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Save
                  </Text>
                )}
              </Pressable>
            )}
            <Pressable
              style={{ paddingVertical: 12 }}
              onPress={handleClosePress}
            >
              <Text
                style={{
                  color: "#3b76c3",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {cancelButtonText}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet> */}
    </>
  );
};

export default BottomSheetComponent;
