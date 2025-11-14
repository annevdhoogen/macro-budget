import { useState, useEffect } from "react";
import "./App.css";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// localStorage helper functions
function setLocalStorage(name, value) {
  try {
    localStorage.setItem(name, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

function getLocalStorage(name) {
  try {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Error reading from localStorage:", e);
    return null;
  }
}

function removeLocalStorage(name) {
  try {
    localStorage.removeItem(name);
  } catch (e) {
    console.error("Error removing from localStorage:", e);
  }
}

const DEFAULT_DAILY_BUDGET = {
  carbs: "270",
  protein: "110",
  fat: "65",
};

// Calculate calories from macros: 1g protein = 4 kcal, 1g carb = 4 kcal, 1g fat = 9 kcal
const calculateCalories = (carbs, protein, fat) => {
  const carbsNum = parseFloat(carbs) || 0;
  const proteinNum = parseFloat(protein) || 0;
  const fatNum = parseFloat(fat) || 0;
  return carbsNum * 4 + proteinNum * 4 + fatNum * 9;
};

// Get current day name
const getCurrentDay = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
};

// Check if a day is filled (has at least one macro value)
const isDayFilled = (dayEntry) => {
  return (
    parseFloat(dayEntry.calories) > 0 ||
    parseFloat(dayEntry.carbs) > 0 ||
    parseFloat(dayEntry.protein) > 0 ||
    parseFloat(dayEntry.fat) > 0
  );
};

// Request notification permission and set up daily reminder
const setupNotifications = (getWeeklyEntries) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  // Request permission
  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        scheduleDailyReminder(getWeeklyEntries);
      }
    });
  } else if (Notification.permission === "granted") {
    scheduleDailyReminder(getWeeklyEntries);
  }
};

// Store interval reference to avoid multiple timers
let notificationInterval = null;
let notificationTimeout = null;

// Schedule daily reminder at 22:00
const scheduleDailyReminder = (getWeeklyEntries) => {
  // Clear any existing timers
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  const checkAndNotify = () => {
    const weeklyEntries = getWeeklyEntries();
    const currentDay = getCurrentDay();
    const dayEntry = weeklyEntries[currentDay];

    if (dayEntry && !isDayFilled(dayEntry)) {
      new Notification("Macros Reminder", {
        body: `Don't forget to fill in your macros for ${currentDay}!`,
        icon: "/icon-block.svg",
        badge: "/icon-block.svg",
        tag: `macro-reminder-${currentDay}`,
      });
    }
  };

  // Check immediately if it's after 22:00
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour >= 22) {
    checkAndNotify();
  }

  // Schedule check for 22:00 today if not past yet, otherwise schedule for tomorrow
  const targetTime = new Date();
  if (currentHour >= 22) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  targetTime.setHours(22, 0, 0, 0);

  const msUntilTarget = targetTime.getTime() - now.getTime();

  notificationTimeout = setTimeout(() => {
    checkAndNotify();
    // Set up recurring check every 24 hours
    notificationInterval = setInterval(checkAndNotify, 24 * 60 * 60 * 1000);
  }, msUntilTarget);
};

function App() {
  // Initialize state from localStorage if available
  const getInitialDailyBudget = () => {
    const saved = getLocalStorage("macroDailyBudget");
    if (saved) {
      // Remove calories if it exists (for backward compatibility)
      const { calories, ...rest } = saved;
      return rest;
    }
    return DEFAULT_DAILY_BUDGET;
  };

  const getInitialWeeklyEntries = () => {
    const saved = getLocalStorage("macroWeeklyEntries");
    if (saved) return saved;
    return DAYS.reduce((acc, day) => {
      acc[day] = { calories: "", carbs: "", protein: "", fat: "" };
      return acc;
    }, {});
  };

  const [dailyBudget, setDailyBudget] = useState(getInitialDailyBudget);
  const [weeklyEntries, setWeeklyEntries] = useState(getInitialWeeklyEntries);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Set up notifications when app loads and when weeklyEntries changes
  useEffect(() => {
    if (isInitialized && weeklyEntries) {
      setupNotifications(() => weeklyEntries);
    }
  }, [isInitialized, weeklyEntries]);

  // Save to localStorage whenever data changes (but not on initial mount)
  useEffect(() => {
    if (isInitialized) {
      setLocalStorage("macroDailyBudget", dailyBudget);
    }
  }, [dailyBudget, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      setLocalStorage("macroWeeklyEntries", weeklyEntries);
    }
  }, [weeklyEntries, isInitialized]);

  const handleDailyBudgetChange = (field, value) => {
    // Allow empty string or positive whole numbers only (no decimals)
    if (value === "" || /^\d+$/.test(value)) {
      setDailyBudget((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleWeeklyEntryChange = (day, field, value) => {
    // Allow empty string or positive whole numbers only (no decimals)
    if (value === "" || /^\d+$/.test(value)) {
      setWeeklyEntries((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value,
        },
      }));
    }
  };

  const handleClearAll = () => {
    // Reset daily budget to defaults
    setDailyBudget(DEFAULT_DAILY_BUDGET);

    // Reset weekly entries
    const emptyWeeklyEntries = DAYS.reduce((acc, day) => {
      acc[day] = { calories: "", carbs: "", protein: "", fat: "" };
      return acc;
    }, {});
    setWeeklyEntries(emptyWeeklyEntries);

    // Clear localStorage
    removeLocalStorage("macroDailyBudget");
    removeLocalStorage("macroWeeklyEntries");
  };

  // Calculate remaining budget and distribute across remaining days
  const calculateRemaining = () => {
    const dailyCalories = calculateCalories(
      dailyBudget.carbs,
      dailyBudget.protein,
      dailyBudget.fat
    );
    const weeklyBudget = {
      calories: dailyCalories * 7,
      carbs: parseFloat(dailyBudget.carbs) * 7 || 0,
      protein: parseFloat(dailyBudget.protein) * 7 || 0,
      fat: parseFloat(dailyBudget.fat) * 7 || 0,
    };

    const totals = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
    };

    const emptyFields = {
      calories: [],
      carbs: [],
      protein: [],
      fat: [],
    };

    DAYS.forEach((day) => {
      const entry = weeklyEntries[day];
      ["calories", "carbs", "protein", "fat"].forEach((field) => {
        const value = parseFloat(entry[field]);
        if (!isNaN(value) && value > 0) {
          totals[field] += value;
        } else {
          emptyFields[field].push(day);
        }
      });
    });

    const remaining = {
      calories: weeklyBudget.calories - totals.calories,
      carbs: weeklyBudget.carbs - totals.carbs,
      protein: weeklyBudget.protein - totals.protein,
      fat: weeklyBudget.fat - totals.fat,
    };

    // Calculate placeholders for each field type
    const getPlaceholder = (field) => {
      const emptyCount = emptyFields[field].length;
      if (emptyCount === 0) return 0;
      return Math.round(remaining[field] / emptyCount);
    };

    return {
      remaining,
      getPlaceholder,
      isEmptyField: (day, field) => {
        const value = parseFloat(weeklyEntries[day][field]);
        return isNaN(value) || value === 0;
      },
    };
  };

  const { remaining, getPlaceholder, isEmptyField } = calculateRemaining();

  return (
    <div className="App">
      <div className="container">
        <div className="header-section">
          <h1>Macros Calculator</h1>
          <button className="clear-all-btn" onClick={handleClearAll}>
            Clear All
          </button>
        </div>

        <div className="budget-section">
          <h2>Daily Budget</h2>
          <div className="budget-inputs">
            <div className="input-group">
              <label>Calories</label>
              <input
                type="number"
                disabled
                value={calculateCalories(
                  dailyBudget.carbs,
                  dailyBudget.protein,
                  dailyBudget.fat
                )}
                readOnly
              />
              <span className="input-helper">Calculated from macros</span>
            </div>
            <div className="input-group">
              <label>Carbs (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={dailyBudget.carbs}
                onChange={(e) =>
                  handleDailyBudgetChange("carbs", e.target.value)
                }
                placeholder="Daily carbs"
              />
            </div>
            <div className="input-group">
              <label>Protein (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={dailyBudget.protein}
                onChange={(e) =>
                  handleDailyBudgetChange("protein", e.target.value)
                }
                placeholder="Daily protein"
              />
            </div>
            <div className="input-group">
              <label>Fat (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={dailyBudget.fat}
                onChange={(e) => handleDailyBudgetChange("fat", e.target.value)}
                placeholder="Daily fat"
              />
            </div>
          </div>
          <div className="weekly-budget">
            <p>
              Weekly Budget:{" "}
              {calculateCalories(
                dailyBudget.carbs,
                dailyBudget.protein,
                dailyBudget.fat
              ) * 7}{" "}
              cal, {parseFloat(dailyBudget.carbs) * 7 || 0}g carbs,{" "}
              {parseFloat(dailyBudget.protein) * 7 || 0}g protein,{" "}
              {parseFloat(dailyBudget.fat) * 7 || 0}g fat
            </p>
            <p className="remaining">
              Remaining: {remaining.calories.toFixed(0)} cal,{" "}
              {remaining.carbs.toFixed(0)}g carbs,{" "}
              {remaining.protein.toFixed(0)}g protein,{" "}
              {remaining.fat.toFixed(0)}g fat
            </p>
          </div>
        </div>

        <div className="weekly-section">
          <h2>Weekly Plan</h2>
          <table className="weekly-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Calories</th>
                <th>Carbs (g)</th>
                <th>Protein (g)</th>
                <th>Fat (g)</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const entry = weeklyEntries[day];
                return (
                  <tr key={day}>
                    <td className="day-label">{day}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.calories}
                        onChange={(e) =>
                          handleWeeklyEntryChange(
                            day,
                            "calories",
                            e.target.value
                          )
                        }
                        placeholder={
                          isEmptyField(day, "calories")
                            ? getPlaceholder("calories").toString()
                            : ""
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.carbs}
                        onChange={(e) =>
                          handleWeeklyEntryChange(day, "carbs", e.target.value)
                        }
                        placeholder={
                          isEmptyField(day, "carbs")
                            ? getPlaceholder("carbs").toString()
                            : ""
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.protein}
                        onChange={(e) =>
                          handleWeeklyEntryChange(
                            day,
                            "protein",
                            e.target.value
                          )
                        }
                        placeholder={
                          isEmptyField(day, "protein")
                            ? getPlaceholder("protein").toString()
                            : ""
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.fat}
                        onChange={(e) =>
                          handleWeeklyEntryChange(day, "fat", e.target.value)
                        }
                        placeholder={
                          isEmptyField(day, "fat")
                            ? getPlaceholder("fat").toString()
                            : ""
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile-friendly card layout */}
          <div className="weekly-mobile">
            {DAYS.map((day) => {
              const entry = weeklyEntries[day];
              return (
                <div key={day} className="day-card">
                  <div className="day-card-header">{day}</div>
                  <div className="day-card-inputs">
                    <div className="day-card-input-group">
                      <label>Calories</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.calories}
                        onChange={(e) =>
                          handleWeeklyEntryChange(
                            day,
                            "calories",
                            e.target.value
                          )
                        }
                        placeholder={
                          isEmptyField(day, "calories")
                            ? getPlaceholder("calories").toString()
                            : ""
                        }
                      />
                    </div>
                    <div className="day-card-input-group">
                      <label>Carbs (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.carbs}
                        onChange={(e) =>
                          handleWeeklyEntryChange(day, "carbs", e.target.value)
                        }
                        placeholder={
                          isEmptyField(day, "carbs")
                            ? getPlaceholder("carbs").toString()
                            : ""
                        }
                      />
                    </div>
                    <div className="day-card-input-group">
                      <label>Protein (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.protein}
                        onChange={(e) =>
                          handleWeeklyEntryChange(
                            day,
                            "protein",
                            e.target.value
                          )
                        }
                        placeholder={
                          isEmptyField(day, "protein")
                            ? getPlaceholder("protein").toString()
                            : ""
                        }
                      />
                    </div>
                    <div className="day-card-input-group">
                      <label>Fat (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={entry.fat}
                        onChange={(e) =>
                          handleWeeklyEntryChange(day, "fat", e.target.value)
                        }
                        placeholder={
                          isEmptyField(day, "fat")
                            ? getPlaceholder("fat").toString()
                            : ""
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
