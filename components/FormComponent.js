import React from "react";
import { View } from "react-native";
import SliderComp from "@/components/SliderComp";

const FormComponent = ({ control, reset, errors }) => {
  return (
    <View>
      <SliderComp control={control} name="watching" label="Watching" />
      {errors.watching && <Text>{errors.watching.message}</Text>}

      <SliderComp control={control} name="writing" label="Writing" />
      {errors.writing && <Text>{errors.writing.message}</Text>}
    </View>
  );
};

export default FormComponent;
