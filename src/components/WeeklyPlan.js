import { DAYS } from "../utils/macros";

function WeeklyPlan({
  weeklyEntries,
  onEntryChange,
  getPlaceholder,
  isEmptyField,
}) {
  return (
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
                {["calories", "carbs", "protein", "fat"].map((field) => (
                  <td key={field}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={entry[field]}
                      onChange={(e) =>
                        onEntryChange(day, field, e.target.value)
                      }
                      placeholder={
                        isEmptyField(day, field)
                          ? getPlaceholder(field).toString()
                          : ""
                      }
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="weekly-mobile">
        {DAYS.map((day) => {
          const entry = weeklyEntries[day];
          return (
            <div key={day} className="day-card">
              <div className="day-card-header">{day}</div>
              <div className="day-card-inputs">
                {[
                  { label: "Calories", field: "calories" },
                  { label: "Carbs (g)", field: "carbs" },
                  { label: "Protein (g)", field: "protein" },
                  { label: "Fat (g)", field: "fat" },
                ].map(({ label, field }) => (
                  <div className="day-card-input-group" key={field}>
                    <label>{label}</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={entry[field]}
                      onChange={(e) =>
                        onEntryChange(day, field, e.target.value)
                      }
                      placeholder={
                        isEmptyField(day, field)
                          ? getPlaceholder(field).toString()
                          : ""
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyPlan;
