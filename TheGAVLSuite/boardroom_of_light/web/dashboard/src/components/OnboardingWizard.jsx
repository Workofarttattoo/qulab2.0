import { useEffect, useState } from "react";

const defaultStatus = {
  ein: "pending",
  dba: "pending",
  state_tax: "pending",
  county_filing: "pending",
  notes: "",
};

export default function OnboardingWizard({ status, onSave, loading }) {
  const [form, setForm] = useState(defaultStatus);

  useEffect(() => {
    setForm({ ...defaultStatus, ...status });
  }, [status]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Onboarding Wizard</h2>
        <a
          href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
          target="_blank"
          rel="noreferrer"
        >
          IRS EIN portal ↗
        </a>
      </div>
      <form className="wizard" onSubmit={handleSubmit}>
        {[
          { key: "ein", label: "EIN status" },
          { key: "dba", label: "DBA filing" },
          { key: "state_tax", label: "State tax" },
          { key: "county_filing", label: "County seat" },
        ].map(({ key, label }) => (
          <label key={key} className="wizard-row">
            <span>{label}</span>
            <select value={form[key]} onChange={(e) => handleChange(key, e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        ))}
        <label className="wizard-col">
          <span>Notes</span>
          <textarea
            value={form.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Track concierge waivers, filings, and hand-offs."
          />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save onboarding"}
        </button>
      </form>
    </div>
  );
}
