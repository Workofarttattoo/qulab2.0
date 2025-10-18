import { useState } from "react";

export default function BusinessLockPanel({ research, locked, onLock, onDestroy, busy }) {
  const [selected, setSelected] = useState("");
  const [plan, setPlan] = useState("");
  const [budget, setBudget] = useState(75000);
  const [objectives, setObjectives] = useState(
    "Launch MVP;Close 3 lighthouse customers;Publish proof log daily",
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selected) return;
    onLock({
      idea_id: selected,
      compliance_plan: plan || "90-day compliance sprint with C&EO oversight.",
      first_quarter_budget: Number(budget),
      key_objectives: objectives
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Business Lock</h2>
        {locked && <span className="badge">Locked</span>}
      </div>
      {locked ? (
        <div className="locked">
          <h3>{locked.idea.title}</h3>
          <p>{locked.idea.description}</p>
          <ul>
            <li>
              <strong>Budget:</strong> ${locked.first_quarter_budget.toLocaleString()}
            </li>
            <li>
              <strong>Objectives:</strong> {locked.key_objectives.join(", ")}
            </li>
            <li>
              <strong>Compliance:</strong> {locked.compliance_plan}
            </li>
          </ul>
          <button className="danger" onClick={onDestroy} disabled={busy}>
            Destroy business lock
          </button>
        </div>
      ) : (
        <form className="wizard" onSubmit={handleSubmit}>
          <label className="wizard-row">
            <span>Select idea</span>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Pick from Top-10</option>
              {(research?.top_ten || []).map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.title}
                </option>
              ))}
            </select>
          </label>
          <label className="wizard-row">
            <span>First quarter budget</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              step="5000"
            />
          </label>
          <label className="wizard-col">
            <span>Compliance Plan</span>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Outline compliance guardrails."
            />
          </label>
          <label className="wizard-col">
            <span>Key Objectives</span>
            <textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Separate objectives with semicolons"
            />
          </label>
          <button className="primary" type="submit" disabled={busy || !selected}>
            {busy ? "Locking..." : "Commit to single business"}
          </button>
        </form>
      )}
    </div>
  );
}
