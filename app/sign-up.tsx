import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { useAuth } from "@/context/authContext";

const { height } = Dimensions.get("window");

const signUp = () => {
  const { isAuthenticated, loading, register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDaftar = async () => {
    if (!username || !email || !password) {
      Alert.alert("Oops!", "Pastikan data lengkap");
      return;
    }

    if (loading) return;

    await register({ username, email, password });
  };

  if (isAuthenticated) return <Redirect href={"/(app)"} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>
            Sign Up
          </Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color={"gray"} />
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color={"gray"} />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={styles.passwordContainer}>
            <Feather name="lock" size={20} color={"gray"} />
            <TextInput
              placeholder="Password"
              textContentType="password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                color={"gray"}
                size={20}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleDaftar}
          >
            {loading ? (
              <ActivityIndicator color={"white"} size={30} />
            ) : (
              <Text style={styles.signUpButtonText}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.signInText}>
            Already have an account?{" "}
            <Link
              href={"sign-in"}
              style={styles.signInLink}
            >
              Sign In
            </Link>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  innerContainer: {
    minHeight: height,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "TT Interphases Pro DemiBold",
    color: "#3a3a3a",
    marginBottom: 20,
  },
  inputContainer: {
    height: 44,
    flexDirection: "row",
    backgroundColor: "white",
    borderColor: "#d1d1d1",
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
  },
  passwordContainer: {
    height: 48,
    flexDirection: "row",
    backgroundColor: "white",
    borderColor: "#d1d1d1",
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
  },
  input: {
    flex: 1,
    fontFamily: "TT Interphases Pro Medium",
  },
  signUpButton: {
    backgroundColor: "#001ef5",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 20,
  },
  signUpButtonText: {
    color: "white",
    fontFamily: "TT Interphases Pro DemiBold",
    fontSize: 16,
  },
  signInText: {
    fontFamily: "TT Interphases Pro Regular",
    color: "#3a3a3a",
    textAlign: "center",
  },
  signInLink: {
    fontFamily: "TT Interphases Pro DemiBold",
    color: "#001ef5",
  },
});

export default signUp;
