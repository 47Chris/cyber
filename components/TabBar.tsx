import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabbar} >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
          key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            <View style={{ flex:1, borderRadius: 24, width: 23, height:23, alignItems:"center", justifyContent:"center", backgroundColor: isFocused ? '#4682B4' : 'transparent' }} >
              <Feather name='home' size={24} color={  isFocused ? 'white' : '#222' }/>
            </View>
            {/* <Text style={{ color: isFocused ? '#4682B4' : '#222' }}>
              {label}
            </Text> */}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
    tabbar: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginBottom:26,
        padding:12,
        borderRadius: 30,
    },
    tabbarItem:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        gap:5
    }
})

export default TabBar;

