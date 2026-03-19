import { calculateCalories } from "../utils/macros";

function DailyBudget({ dailyBudget, budgetLocked, onBudgetChange, onToggleLock }) {
  return (
    <div className="budget-section">
      <div className="budget-header">
        <h2>Daily Budget</h2>
        <button
          className={`lock-btn${budgetLocked ? " locked" : ""}`}
          onClick={onToggleLock}
          title={budgetLocked ? "Unlock budget" : "Lock budget"}
        >
          {budgetLocked ? "🔒" : "🔓"}
        </button>
      </div>
      <div className="budget-inputs">
        <div className="input-group">
          <label>Calories</label>
          <input
            type="number"
            disabled
            value={calculateCalories(
              dailyBudget.carbs,
              dailyBudget.protein,
              dailyBudget.fat,
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
            disabled={budgetLocked}
            value={dailyBudget.carbs}
            onChange={(e) => onBudgetChange("carbs", e.target.value)}
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
            disabled={budgetLocked}
            value={dailyBudget.protein}
            onChange={(e) => onBudgetChange("protein", e.target.value)}
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
            disabled={budgetLocked}
            value={dailyBudget.fat}
            onChange={(e) => onBudgetChange("fat", e.target.value)}
            placeholder="Daily fat"
          />
        </div>
      </div>
    </div>
  );
}

export default DailyBudget;
