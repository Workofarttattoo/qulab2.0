import { useState } from "react";

export default function CompliancePanel({ compliance, onLog }) {
  const [form, setForm] = useState({
    category: "ops",
    summary: "",
    owner: "C&EO",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.summary) return;
    try {
      setBusy(true);
      await onLog(form);
      setForm({ ...form, summary: "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Compliance & Enhancement</h2>
        <span className="officer">Officer: {compliance?.officer || "C&EO"}</span>
      </div>
      <div className="nudges">
        <h3>Safe nudges</h3>
        <ul>
          {(compliance?.nudges || []).map((nudge, idx) => (
            <li key={idx}>{nudge}</li>
          ))}
        </ul>
      </div>
      <div className="bottlenecks">
        <h3>Bottlenecks</h3>
        <ul>
          {(compliance?.bottlenecks || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="logs">
        <h3>Daily proof logs</h3>
        <ul>
          {(compliance?.logs || []).slice(-5).reverse().map((log) => (
            <li key={log.id}>
              <strong>{new Date(log.timestamp).toLocaleString()}</strong>
              <span>{log.owner}</span>
              <p>{log.summary}</p>
            </li>
          ))}
        </ul>
      </div>
      <form className="wizard" onSubmit={submit}>
        <label className="wizard-row">
          <span>Category</span>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
        <label className="wizard-row">
          <span>Owner</span>
          <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </label>
        <label className="wizard-col">
          <span>Summary</span>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Log progress to keep the C&EO loop tight."
          />
        </label>
        <button className="primary" type="submit" disabled={busy || !form.summary}>
          {busy ? "Logging..." : "Add proof log"}
        </button>
      </form>
    </div>
  );
}
