"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

interface SunriseSunsetData {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    golden_hour: string;
    day_length: string;
    timezone: string;
  };
  status: string;
}

type TimeOfDay = "dawn" | "day" | "golden" | "dusk" | "night";

interface BackgroundContextType {
  currentTime: string;
  sunData: SunriseSunsetData | null;
  timeOfDay: TimeOfDay;
  bgStyle: React.CSSProperties;
  isTestMode: boolean;
  setIsTestMode: (isTestMode: boolean) => void;
  testHour: number;
  setTestHour: (hour: number) => void;
}

export const BackgroundContext = createContext<BackgroundContextType>({
  currentTime: "",
  sunData: null,
  timeOfDay: "day",
  bgStyle: {},
  isTestMode: false,
  setIsTestMode: () => {},
  testHour: 12,
  setTestHour: () => {},
});

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [sunData, setSunData] = useState<SunriseSunsetData | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [testHour, setTestHour] = useState<number>(12);

  useEffect(() => {
    // Get user's location from browser if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchSunriseSunsetData(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to a default location (Beijing)
          fetchSunriseSunsetData(39.9042, 116.4074);
        }
      );
    } else {
      // Fallback to a default location (Beijing)
      fetchSunriseSunsetData(39.9042, 116.4074);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      // Update time of day based on test mode or real time
      if (isTestMode) {
        // In test mode, use the test hour
        const testDate = new Date();
        testDate.setHours(testHour, 0, 0);
        if (sunData) {
          determineTimeOfDay(testDate);
        }
      } else {
        // In normal mode, use current time
        if (sunData) {
          determineTimeOfDay(now);
        }
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [sunData, isTestMode, testHour]);

  // Update background based on time of day
  useEffect(() => {
    updateBackgroundStyle();
  }, [timeOfDay]);

  const fetchSunriseSunsetData = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const response = await fetch(
        `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`
      );
      const data = await response.json();
      setSunData(data);
    } catch (error) {
      console.error("Error fetching sunrise/sunset data:", error);
    }
  };

  const determineTimeOfDay = (now: Date) => {
    if (!sunData) return;

    const parseTimeToDate = (timeStr: string) => {
      const [time, ampm] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      const date = new Date(now);
      let hour = hours;

      if (ampm === "PM" && hours !== 12) {
        hour += 12;
      } else if (ampm === "AM" && hours === 12) {
        hour = 0;
      }

      date.setHours(hour, minutes, 0);
      return date;
    };

    const sunrise = parseTimeToDate(sunData.results.sunrise);
    const sunset = parseTimeToDate(sunData.results.sunset);
    const goldenHour = parseTimeToDate(sunData.results.golden_hour);

    // Add 30 minutes before sunrise for dawn
    const dawn = new Date(sunrise);
    dawn.setMinutes(dawn.getMinutes() - 30);

    // Add 30 minutes after sunset for dusk
    const dusk = new Date(sunset);
    dusk.setMinutes(dusk.getMinutes() + 30);

    if (now < dawn) {
      setTimeOfDay("night");
    } else if (now >= dawn && now < sunrise) {
      setTimeOfDay("dawn");
    } else if (now >= sunrise && now < goldenHour) {
      setTimeOfDay("day");
    } else if (now >= goldenHour && now < sunset) {
      setTimeOfDay("golden");
    } else if (now >= sunset && now < dusk) {
      setTimeOfDay("dusk");
    } else {
      setTimeOfDay("night");
    }
  };

  const updateBackgroundStyle = () => {
    let style: React.CSSProperties = {
      transition: "all 2s ease-in-out",
      minHeight: "100vh",
    };

    switch (timeOfDay) {
      case "dawn":
        style.background = "linear-gradient(135deg, #ff9e9e 0%, #ffd4a9 100%)";
        break;
      case "day":
        style.background = "linear-gradient(135deg, #64b3f4 0%, #c2e9fb 100%)";
        break;
      case "golden":
        style.background = "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)";
        break;
      case "dusk":
        style.background = "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)";
        break;
      case "night":
        style.background =
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)";
        style.color = "white";
        break;
    }

    setBgStyle(style);
  };

  return (
    <BackgroundContext.Provider
      value={{
        currentTime,
        sunData,
        timeOfDay,
        bgStyle,
        isTestMode,
        setIsTestMode,
        testHour,
        setTestHour,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}
