"use client";

import { useContext } from "react";
import { BackgroundContext } from "@/context/background-context";

// SVG Icons for sunrise and sunset
const SunriseIcon = () => (
  <svg
    className="w-3 h-3 mr-1 inline-block"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4V2M4 12H2M6 6L4.5 4.5M18 6L19.5 4.5M22 12H20M12 8V10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M4 16H20" stroke="currentColor" strokeWidth="2" />
    <path d="M5 20H19" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const SunsetIcon = () => (
  <svg
    className="w-3 h-3 mr-1 inline-block"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 10V8M4 14H2M6 8L4.5 6.5M18 8L19.5 6.5M22 14H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M4 18H20" stroke="currentColor" strokeWidth="2" />
    <path d="M5 22H19" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 14C16 11.7909 14.2091 10 12 10C9.79086 10 8 11.7909 8 14"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 2V4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

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

      // Enhanced parabolic arc for more dramatic rise/fall
      const normalizedProgress = progress * 2 - 1; // -1 to 1
      yPos = -70 * (1 - normalizedProgress * normalizedProgress); // -70% at apex
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

      // Flatter arc for moon with cubic easing
      const normalizedProgress = progress * 2 - 1; // -1 to 1
      yPos = -40 * Math.pow(1 - normalizedProgress * normalizedProgress, 1.5); // -40% at apex
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
      <div className="absolute inset-1 bg-yellow-50 rounded-full"></div>
      <div className="absolute right-4 top-3 w-8 h-8 bg-gray-200 rounded-full opacity-40 blur-sm"></div>
    </>
  );

  return (
    <header data-routine-header className="relative isolate mx-auto grid overflow-hidden w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-8 lg:min-h-[96px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:py-5">
      {/* Celestial body (sun/moon) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-32 h-32 opacity-20 transition-all duration-1000 z-0"
        style={{
          left: `${xPos}%`,
          top: `${yPos}%`,
        }}
      >
        {sunOrMoon}
      </div>

      {/* Title */}
      <h1 data-header-title className="relative z-10 col-span-2 row-start-1 text-center text-2xl font-bold tracking-tight whitespace-nowrap sm:text-3xl xl:text-4xl 2xl:text-5xl lg:col-span-1 lg:col-start-2">
        早起的黄金一小时
      </h1>

      {/* Time display and controls */}
      <div data-header-clock className="relative z-10 col-start-1 row-start-2 flex min-w-0 flex-wrap items-center gap-3 justify-self-start lg:row-start-1">
        {/* Time info */}
        <div className="min-w-0 text-left">
          <div className="font-mono text-xl font-medium tracking-tight tabular-nums sm:text-2xl">
            {currentTime}
          </div>
          {sunData && (
            <div className="text-xs mt-0.5 opacity-80 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center whitespace-nowrap">
                <SunriseIcon /> {sunData.results.sunrise}
              </span>
              <span className="flex items-center whitespace-nowrap">
                <SunsetIcon /> {sunData.results.sunset}
              </span>
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
      <a data-header-signature className="relative z-10 col-start-2 row-start-2 inline-flex items-center justify-self-end p-1.5 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 lg:col-start-3 lg:row-start-1" href="https://songhaifan.github.io/frankie-routine/" aria-label="About Frankie routine"><span aria-hidden="true" style={{ display: "block", width: 88, height: 36, backgroundColor: "currentColor", mask: "url(/frankie-signature.svg) center / contain no-repeat", WebkitMask: "url(/frankie-signature.svg) center / contain no-repeat" }} /></a>
    </header>
  );
};

export default Header;
