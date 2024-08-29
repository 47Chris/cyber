import React, { useState, useMemo } from "react";
import { View } from "react-native";
import CalendarStrip from "@/components/CalendarStrip";
import moment from "moment";

const CalendarStripComponent = () => {
  const [selectedDate, setSelectedDate] = useState(moment());

  const datesBlacklistFunc = (date) => date.isoWeekday() === 6;

  const onDateSelected = (date) => {
    setSelectedDate(date);
  };

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  return (
    <View>
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelected={onDateSelected}
        datesBlacklistFunc={datesBlacklistFunc}
        snapPoints={snapPoints}
      />
    </View>
  );
};

export default CalendarStripComponent;
