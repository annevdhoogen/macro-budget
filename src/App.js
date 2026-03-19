import { useState, useEffect } from "react";
import "./App.css";
import { setLocalStorage, getLocalStorage, removeLocalStorage } from "./utils/localStorage";
import { DAYS, DEFAULT_DAILY_BUDGET, calculateCalories } from "./utils/macros";
import DailyBudget from "./components/DailyBudget";
import WeeklyRemaining from "./components/WeeklyRemaining";
import WeeklyPlan from "./components/WeeklyPlan";

function App() {
  const getInitialDailyBudget = () => {
    const saved = getLocalStorage("macroDailyBudget");
    if (saved) {
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
  const [budgetLocked, setBudgetLocked] = useState(
    () => getLocalStorage("macroBudgetLocked") ?? false,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

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

  useEffect(() => {
    if (isInitialized) {
      setLocalStorage("macroBudgetLocked", budgetLocked);
    }
  }, [budgetLocked, isInitialized]);

  const handleDailyBudgetChange = (field, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setDailyBudget((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleWeeklyEntryChange = (day, field, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setWeeklyEntries((prev) => ({
        ...prev,
        [day]: { ...prev[day], [field]: value },
      }));
    }
  };

  const handleClearAll = () => {
    if (!window.confirm("Are you sure you want to clear all weekly entries?")) return;
    const emptyWeeklyEntries = DAYS.reduce((acc, day) => {
      acc[day] = { calories: "", carbs: "", protein: "", fat: "" };
      return acc;
    }, {});
    setWeeklyEntries(emptyWeeklyEntries);
    removeLocalStorage("macroWeeklyEntries");
  };

  const calculateRemaining = () => {
    const dailyCalories = calculateCalories(
      dailyBudget.carbs,
      dailyBudget.protein,
      dailyBudget.fat,
    );
    const weeklyBudget = {
      calories: dailyCalories * 7,
      carbs: parseFloat(dailyBudget.carbs) * 7 || 0,
      protein: parseFloat(dailyBudget.protein) * 7 || 0,
      fat: parseFloat(dailyBudget.fat) * 7 || 0,
    };

    const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
    const emptyFields = { calories: [], carbs: [], protein: [], fat: [] };

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

    const getPlaceholder = (field) => {
      const emptyCount = emptyFields[field].length;
      if (emptyCount === 0) return 0;
      return Math.round(remaining[field] / emptyCount);
    };

    return {
      remaining,
      weeklyBudget,
      totals,
      getPlaceholder,
      isEmptyField: (day, field) => {
        const value = parseFloat(weeklyEntries[day][field]);
        return isNaN(value) || value === 0;
      },
    };
  };

  const { remaining, weeklyBudget, totals, getPlaceholder, isEmptyField } =
    calculateRemaining();

  return (
    <div className="App">
      <div className="container">
        <div className="header-section">
          <h1>Macros Calculator</h1>
          <button className="clear-all-btn" onClick={handleClearAll}>
            Clear All
          </button>
        </div>

        <DailyBudget
          dailyBudget={dailyBudget}
          budgetLocked={budgetLocked}
          onBudgetChange={handleDailyBudgetChange}
          onToggleLock={() => setBudgetLocked((prev) => !prev)}
        />

        <WeeklyRemaining
          weeklyBudget={weeklyBudget}
          totals={totals}
          remaining={remaining}
        />

        <WeeklyPlan
          weeklyEntries={weeklyEntries}
          onEntryChange={handleWeeklyEntryChange}
          getPlaceholder={getPlaceholder}
          isEmptyField={isEmptyField}
        />
      </div>
    </div>
  );
}

export default App;
