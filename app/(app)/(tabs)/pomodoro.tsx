import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Vibration, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useSettings } from '@/context/SettingsContext';
import { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PomodoroTimer = () => {
  const { focusTime, shortBreakTime, longBreakTime, numberOfSessions } = useSettings();
  
  const [seconds, setSeconds] = useState(focusTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showBreakChoice, setShowBreakChoice] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);

  const timerRef = useRef(null);
  const soundRef = useRef(null);
  const celebrateSoundRef = useRef(null);

  useEffect(() => {
    const loadSounds = async () => {
      const { sound: intervalSound } = await Audio.Sound.createAsync(
        require('@/assets/sound.mp3')
      );
      soundRef.current = intervalSound;

      const { sound: celebrateSound } = await Audio.Sound.createAsync(
        require('@/assets/celebrate.mp3')
      );
      celebrateSoundRef.current = celebrateSound;
    };
    loadSounds();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (celebrateSoundRef.current) {
        celebrateSoundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && !isPaused && !isDone) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            Vibration.vibrate(1000);
            if (soundRef.current) {
              soundRef.current.playAsync();
            }
            clearInterval(timerRef.current);
            if (completedCycles === numberOfSessions - 1 && !isBreak) {
              setIsDone(true);
              if (celebrateSoundRef.current) {
                celebrateSoundRef.current.playAsync();
              }
            } else {
              handleNextInterval();
            }
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isActive || isPaused || isDone) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, isBreak, completedCycles, isDone]);

  const handleNextInterval = () => {
    if (isBreak) {
      setShowContinuePrompt(true); // Show continue prompt after break ends
    } else {
      setShowBreakChoice(true); // Show break choice dialog
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handleBreakChoice = (isLongBreak) => {
    setShowBreakChoice(false);
    setIsBreak(true);
    setSeconds(isLongBreak ? longBreakTime : shortBreakTime);
  };

  const handleContinue = () => {
    setShowContinuePrompt(false);
    setIsBreak(false);
    setSeconds(focusTime);
    setCompletedCycles(prev => prev + 1);
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Interval",
      "Are you sure you want to skip to the next interval?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: handleNextInterval,
        },
      ]
    );
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsBreak(false);
    setCompletedCycles(0);
    setIsDone(false);
    setSeconds(focusTime);
  };

  const handleReset = () => {
    setSeconds(isBreak ? shortBreakTime : focusTime);
  };

  const progress = (seconds / (isBreak ? (completedCycles === numberOfSessions - 1 ? longBreakTime : shortBreakTime) : focusTime)) * 100;
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const currentSession = completedCycles + (isBreak ? 0.5 : 0) + 1;
  const totalSessions = numberOfSessions;
  const sessionText = `${Math.ceil(currentSession)} of ${totalSessions} sessions`;
  const timerText = formatTime(seconds);

  return (
    <View style={styles.container}>
      {!isDone ? (
        <>
          {showBreakChoice ? (
            <View style={styles.breakChoiceContainer}>
              <Text style={styles.breakChoiceText}>Choose Break Type:</Text>
              <Button title="Short Break" onPress={() => handleBreakChoice(false)} />
              <Button title="Long Break" onPress={() => handleBreakChoice(true)} />
            </View>
          ) : showContinuePrompt ? (
            <View style={styles.breakChoiceContainer}>
              <Text style={styles.breakChoiceText}>Break Over! Continue to the next session?</Text>
              <Button title="Continue" onPress={handleContinue} />
            </View>
          ) : (
            <>
              <View style={styles.circleContainer}>
                <AnimatedCircularProgress
                  size={width / 1.5}
                  width={8}
                  fill={progress}
                  tintColor={isBreak ? '#FF6347' : '#4682B4'}
                  renderCap={({ center }) => <Circle cx={center.x} cy={center.y} r="1" fill="blue" />}
                  backgroundColor="#E0E0E0"
                  lineCap="round"
                  padding={8}
                >
                  {
                    (fill) => (
                      <View style={styles.centerContent}>
                        <Text style={styles.timerText}>{timerText}</Text>
                        <Text style={styles.sessionText}>{sessionText}</Text>
                      </View>
                    )
                  }
                </AnimatedCircularProgress>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => {
                    if (isActive) {
                      setIsPaused(!isPaused);
                    } else {
                      setIsActive(true);
                      setIsPaused(false);
                    }
                  }}  style={[{
                    backgroundColor: "#4682B4",  
                    width: 50, height: 50, borderRadius: 100, alignItems: "center", justifyContent: "center" 
                  }, ]}>
                <Ionicons name={isActive ? (isPaused ? "play-outline" : "pause") : "play-outline"} size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleStop}
                   style={[{
                    backgroundColor: "#4682B4",  
                    width: 50, height: 50, borderRadius: 100, alignItems: "center", justifyContent: "center" 
                  }, !isActive || seconds === 0 ? { opacity: 0.5 } : null]}>
                <Ionicons name={"stop-outline"} size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleReset}
                  disabled={!isActive || seconds === 0} style={[{
                    backgroundColor: "#4682B4",  
                    width: 50, height: 50, borderRadius: 100, alignItems: "center", justifyContent: "center" 
                  }, !isActive || seconds === 0 ? { opacity: 0.5 } : null]}
                   >
                <Ionicons name={"reload"} size={24} color="white" style={{transform: [{ scaleY: -1 }]}}/>
                </TouchableOpacity>
                
                 <TouchableOpacity onPress={handleSkip}
                  disabled={!isActive || seconds === 0} style={[{
                    backgroundColor: "#4682B4",  
                    width: 50, height: 50, borderRadius: 100, alignItems: "center", justifyContent: "center" 
                  }, !isActive || seconds === 0 ? { opacity: 0.5 } : null]}
                   >
                <Ionicons name={"play-skip-forward-outline"} size={28} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.status}>{isBreak ? "Break" : "Work"}</Text>
            </>
          )}
        </>
      ) : (
        <View style={styles.doneContainer}>
          <Text style={styles.done}>Well Done!</Text>
          <Button title="Reset" onPress={handleStop} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    width: width / 2.5 * 2,
    height: width / 2.5 * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 60,
    color: 'black',
    textAlign: 'center',
    fontWeight: "600",
  },
  sessionText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  status: {
    fontSize: 24,
    marginTop: 20,
  },
  doneContainer: {
    alignItems: 'center',
  },
  done: {
    fontSize: 36,
    color: 'green',
    marginBottom: 20,
  },
  breakChoiceContainer: {
    alignItems: 'center',
  },
  breakChoiceText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default PomodoroTimer;
