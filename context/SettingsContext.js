import React, { createContext, useState, useContext } from "react";

// Create a context with default values
const SettingsContext = createContext({
  focusTime: 10,
  shortBreakTime: 3,
  longBreakTime: 5,
  numberOfSessions: 3,
  setSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    focusTime: 10,
    shortBreakTime: 3,
    longBreakTime: 5,
    numberOfSessions: 3,
  });

  return (
    <SettingsContext.Provider value={{ ...settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
