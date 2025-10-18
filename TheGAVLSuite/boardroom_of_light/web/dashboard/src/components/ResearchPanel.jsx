import { useState } from "react";

export default function ResearchPanel({ onGenerate, research, exportingUrl, loading }) {
  const [form, setForm] = useState({
    focus_area: "operations",
    persona: "founder",
    budget: 150000,
    risk_tolerance: "medium",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onGenerate({ ...form, budget: Number(form.budget) });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Research Mode</h2>
        {research && (
          <a className="secondary" href={exportingUrl} target="_blank" rel="noreferrer">
            Export 10k CSV
          </a>
        )}
      </div>
      <form className="wizard" onSubmit={handleSubmit}>
        <label className="wizard-row">
          <span>Focus area</span>
          <input value={form.focus_area} onChange={(e) => handleChange("focus_area", e.target.value)} />
        </label>
        <label className="wizard-row">
          <span>Persona</span>
          <input value={form.persona} onChange={(e) => handleChange("persona", e.target.value)} />
        </label>
        <label className="wizard-row">
          <span>Budget</span>
          <input
            type="number"
            value={form.budget}
            onChange={(e) => handleChange("budget", e.target.value)}
            min="0"
            step="1000"
          />
        </label>
        <label className="wizard-row">
          <span>Risk tolerance</span>
          <select value={form.risk_tolerance} onChange={(e) => handleChange("risk_tolerance", e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate 10,000 ideas"}
        </button>
      </form>
      {research && (
        <div className="research-metrics">
          <div>
            <span>Total ideas</span>
            <strong>{research.total_ideas.toLocaleString()}</strong>
          </div>
          <div>
            <span>DO-NOW average ROI</span>
            <strong>
              {(
                research.top_five_do_now.reduce((sum, item) => sum + item.projected_roi, 0) /
                Math.max(1, research.top_five_do_now.length)
              ).toFixed(1)}%
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
