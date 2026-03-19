import { MACRO_FIELDS, fmt } from "../utils/macros";

function WeeklyRemaining({ weeklyBudget, totals, remaining }) {
  return (
    <div className="weekly-budget">
      <h3>Weekly Remaining</h3>
      <div className="remaining-bars">
        {MACRO_FIELDS.map(({ label, key, unit }) => {
          const budget = weeklyBudget[key];
          const used = totals[key];
          const pct = budget > 0 ? Math.min((used / budget) * 100, 100) : 0;
          const over = used > budget;
          return (
            <div className="remaining-bar-row" key={key}>
              <span className="remaining-bar-label">{label}</span>
              <div className="remaining-bar-track">
                <div
                  className={`remaining-bar-fill${over ? " over" : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`remaining-bar-value${over ? " over" : ""}`}>
                {over
                  ? `${fmt(Math.abs(remaining[key]))}${unit} over`
                  : `${fmt(remaining[key])}${unit} left`}
              </span>
              <span className="remaining-bar-detail">
                {fmt(used)} / {fmt(budget)}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyRemaining;
