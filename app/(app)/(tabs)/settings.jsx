import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import SliderComp from "@/components/SliderComp";
const SettingsScreen = () => {
  const {
    focusTime,
    shortBreakTime,
    longBreakTime,
    numberOfSessions,
    setSettings,
  } = useSettings();

  const [newFocusTime, setNewFocusTime] = useState(focusTime.toString());
  const [newShortBreakTime, setNewShortBreakTime] = useState(
    shortBreakTime.toString()
  );
  const [newLongBreakTime, setNewLongBreakTime] = useState(
    longBreakTime.toString()
  );
  const [selectedSessions, setSelectedSessions] = useState(numberOfSessions);

  const handleSave = () => {
    setSettings({
      focusTime: parseInt(newFocusTime) * 60, // Convert minutes to seconds
      shortBreakTime: parseInt(newShortBreakTime) * 60,
      longBreakTime: parseInt(newLongBreakTime) * 60,
      numberOfSessions: selectedSessions,
    });
  };

  const handleSessionSelect = (session) => {
    setSelectedSessions(session);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Focus Time (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={newFocusTime}
        onChangeText={setNewFocusTime}
      />
      <SliderComp
        title="Watching"
        minimumValue={0}
        maximumValue={100}
        fieldName="watching"
        // value={getValues('watching')}
        // control={control}
        // onChange={(value) => {
        //   setNewFocusTime;
        // }}
        // errorMessage={errors?.sessions?.message}
      />
      <Text style={styles.label}>Short Break Time (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={newShortBreakTime}
        onChangeText={setNewShortBreakTime}
      />

      <Text style={styles.label}>Long Break Time (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={newLongBreakTime}
        onChangeText={setNewLongBreakTime}
      />

      <Text style={styles.label}>Number of Sessions:</Text>
      <View style={styles.sessionSelector}>
        {[1, 2, 3, 4, 5].map((session) => (
          <TouchableOpacity
            key={session}
            style={[
              styles.sessionOption,
              selectedSessions === session && styles.selectedSessionOption,
            ]}
            onPress={() => handleSessionSelect(session)}
          >
            <Text
              style={[
                styles.sessionText,
                selectedSessions === session && styles.selectedSessionText,
              ]}
            >
              {session}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Save Settings" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  sessionSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  sessionOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  selectedSessionOption: {
    borderColor: "#4682B4",
    backgroundColor: "#4682B4",
  },
  sessionText: {
    fontSize: 18,
    color: "#000",
  },
  selectedSessionText: {
    color: "#fff",
  },
});

export default SettingsScreen;
