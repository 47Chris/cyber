import { Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";


export default function Index() {
  if (true) return <Redirect href={"/(app)"} />;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>We got work to do.</Text>
    </View>
  );
}
