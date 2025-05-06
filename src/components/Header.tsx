"use client";

import { useContext } from "react";
import { BackgroundContext } from "@/context/background-context";

const Header = () => {
  const {
    currentTime,
    sunData,
    timeOfDay,
    isTestMode,
    setIsTestMode,
    testHour,
    setTestHour,
  } = useContext(BackgroundContext);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  const handleToggleTestMode = () => {
    setIsTestMode(!isTestMode);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestHour(parseInt(e.target.value));
  };

  const timeLabels = {
    dawn: "黎明",
    day: "白天",
    golden: "黄金时刻",
    dusk: "傍晚",
    night: "夜晚",
  };

  // Calculate position of celestial body based on time
  const getCelestialPosition = () => {
    const hour = isTestMode ? testHour : new Date().getHours();
    const minute = new Date().getMinutes();
    const timeDecimal = hour + minute / 60;

    // Position sun/moon along an arc from left to right
    // 6am (6) -> leftmost (-10%)
    // 12pm (12) -> top (50%)
    // 6pm (18) -> rightmost (110%)
    let xPos = 0;
    let yPos = 0;

    if (timeDecimal >= 6 && timeDecimal <= 18) {
      // Day time (sun) - moves in an arc from left to right
      const progress = (timeDecimal - 6) / 12; // 0 to 1 for 6am to 6pm
      xPos = -10 + progress * 120; // -10% to 110%

      // Arc: y = sin(x * PI) where x goes from 0 to 1
      // This creates a path that rises and falls
      yPos = -50 * Math.sin(progress * Math.PI); // -50% at highest (above the header)
    } else {
      // Night time (moon) - moves in an arc from right to left
      let progress = 0;
      if (timeDecimal > 18) {
        // 6pm to midnight
        progress = (timeDecimal - 18) / 6; // 0 to 1
      } else {
        // midnight to 6am
        progress = (timeDecimal + 6) / 6; // 1 to 2, but we remap to 1 to 0
        progress = 2 - progress;
      }

      xPos = 110 - progress * 120; // 110% to -10%
      yPos = -30 * Math.sin(progress * Math.PI); // -30% at highest (less high than sun)
    }

    return { xPos, yPos };
  };

  const { xPos, yPos } = getCelestialPosition();

  const isSunVisible = () => {
    const hour = isTestMode ? testHour : new Date().getHours();
    return hour >= 6 && hour < 18;
  };

  const sunOrMoon = isSunVisible() ? (
    // Sun
    <>
      <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-80 blur-sm"></div>
      <div className="absolute inset-2 bg-yellow-200 rounded-full"></div>
    </>
  ) : (
    // Moon
    <>
      <div className="absolute inset-0 bg-gray-200 rounded-full opacity-80 blur-sm"></div>
      <div className="absolute inset-1 bg-gray-100 rounded-full"></div>
      <div className="absolute right-4 top-3 w-8 h-8 bg-gray-200 rounded-full opacity-40 blur-sm"></div>
    </>
  );

  return (
    <div className="flex items-center justify-between px-8 py-6 relative  h-24">
      {/* Celestial body (sun/moon) */}
      <div
        className="absolute w-32 h-32 transition-all duration-1000 z-0"
        style={{
          left: `${xPos}%`,
          top: `${yPos}%`,
        }}
      >
        {sunOrMoon}
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold relative ml-20 tracking-tight z-10">
        早起的黄金一小时
      </h1>

      {/* Time display and controls */}
      <div className="flex items-center gap-4 z-10">
        {/* Time info */}
        <div className="text-right">
          <div className="font-mono text-2xl font-medium tracking-tight">
            {currentTime}
          </div>
          {sunData && (
            <div className="text-xs mt-0.5 opacity-80 font-medium space-x-2">
              <span>🌅 {sunData.results.sunrise}</span>
              <span>🌇 {sunData.results.sunset}</span>
            </div>
          )}
        </div>

        {/* Only show test controls in development mode */}
        {isDevelopment && (
          <>
            {/* Divider */}
            <div className="w-px h-12 bg-current opacity-20"></div>

            {/* Test controls */}
            <div className="flex items-center gap-3">
              {/* Time of day indicator */}
              <div className="text-sm font-medium">{timeLabels[timeOfDay]}</div>

              {/* Test mode toggle and slider */}
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={handleToggleTestMode}
                  className={`
                    text-xs px-2 py-1 rounded-full transition-colors
                    ${
                      isTestMode
                        ? "bg-white/20 backdrop-blur-sm"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  {isTestMode ? "测试中" : "测试"}
                </button>

                {isTestMode && (
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={testHour}
                    onChange={handleHourChange}
                    className="w-24 h-1 accent-current opacity-80 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
