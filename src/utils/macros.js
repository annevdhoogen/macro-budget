export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DEFAULT_DAILY_BUDGET = {
  carbs: "170",
  protein: "110",
  fat: "50",
};

export const MACRO_FIELDS = [
  { label: "Calories", key: "calories", unit: "cal" },
  { label: "Carbs", key: "carbs", unit: "g" },
  { label: "Protein", key: "protein", unit: "g" },
  { label: "Fat", key: "fat", unit: "g" },
];

// 1g protein = 4 kcal, 1g carb = 4 kcal, 1g fat = 9 kcal
export const calculateCalories = (carbs, protein, fat) => {
  const carbsNum = parseFloat(carbs) || 0;
  const proteinNum = parseFloat(protein) || 0;
  const fatNum = parseFloat(fat) || 0;
  return carbsNum * 4 + proteinNum * 4 + fatNum * 9;
};

export const fmt = (n) =>
  Math.round(n).toLocaleString("nl-NL", { maximumFractionDigits: 0 });
