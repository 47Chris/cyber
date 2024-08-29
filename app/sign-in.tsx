import React, { memo, useState } from 'react';
import { View } from 'react-native';
import TextView from '@/components/TextView';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './LoginStyles.styles';
import IconFacebook from '../assets/icons/login/ic_facebook.svg';
import IconGoogle from '../assets/icons/login/ic_google.svg';
import IconApple from '../assets/icons/login/ic_apple.svg';
import Button from '@/components/Button';
import { navigate } from '@/navigators/NavigationServices';
import RouteName from '@/navigators/RouteName';
import HeaderWrap from '@/components/HeaderWrap';
import TouchableDebounce from '@/components/TouchableDebounce';
import { Link, Redirect } from "expo-router";
import { useAuth } from "@/context/authContext";
import {  useRouter } from "expo-router";



const Login = () => {

  const router = useRouter();


  const handleSignInWithPassword = () => {
    navigate(RouteName.LoginWithPass);
  };

  const handleSignUp = () => {
    navigate(RouteName.SignUp);
  };

  const { loading, isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Oops!", "Input tidak lengkap");
      return;
    }
    await login(email, password);
  };

  if (isAuthenticated) return <Redirect href={"/(app)"} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerScrollView}>
        {/* <HeaderWrap isBackMode containerStyle={styles.headerWrapper} /> */}
        <TextView style={styles.textHeader}>Let's you in</TextView>

        <View style={styles.loginSocial}>
          {/* <IconFacebook width={20} height={20} /> */}
          <TextView>Continue with Facebook</TextView>
        </View>

        <TouchableDebounce
          style={styles.loginSocial}
        >
          {/* <IconGoogle width={20} height={20} /> */}
          <TextView>Continue with Google</TextView>
        </TouchableDebounce>

        <TouchableDebounce
          style={styles.loginSocial}
        >
          {/* <IconApple width={20} height={20} /> */}
          <TextView>Continue with Apple</TextView>
        </TouchableDebounce>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}
        >
          <View style={styles.dividerLine} />
          <View>
            <TextView style={{ width: 50, textAlign: 'center' }}>Or</TextView>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <Button
          style={styles.buttonNext}
          textStyle={styles.buttonTextStyle}
          text="Sign in with password"
          onPress={() => router.replace("/sign-in-pass")}
        />
        <TextView style={styles.bottomText}>
          Don't have an account?
          <TouchableDebounce >
            <TextView style={styles.signInText}> Sign up</TextView>
          </TouchableDebounce>
        </TextView>
      </View>
    </SafeAreaView>
  );
};

export default Login;

