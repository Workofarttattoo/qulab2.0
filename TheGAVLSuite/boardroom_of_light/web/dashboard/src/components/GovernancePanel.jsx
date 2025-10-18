export default function GovernancePanel({ dashboard }) {
  if (!dashboard) return null;

  const progress = ["ein", "dba", "state_tax", "county_filing"].filter(
    (key) => dashboard.onboarding?.[key]?.toLowerCase() === "done",
  ).length;

  return (
    <div className="panel governance">
      <div className="panel-header">
        <h2>Governance Console</h2>
        <span>{dashboard.name}</span>
      </div>
      <div className="governance-grid">
        <div>
          <h3>Onboarding completion</h3>
          <p>
            {progress}/4 filings complete
            <br />
            <small>{dashboard.onboarding?.notes || "Keep concierge aligned."}</small>
          </p>
        </div>
        <div>
          <h3>Research pulse</h3>
          <p>
            {dashboard.research_summary?.total_ideas?.toLocaleString() || 0} ideas
            <br />
            Avg ROI: {dashboard.research_summary?.avg_roi?.toFixed?.(1) ?? 0}%
          </p>
        </div>
        <div>
          <h3>Locked business</h3>
          <p>{dashboard.locked_business ? dashboard.locked_business.idea.title : "Pending lock"}</p>
        </div>
        <div>
          <h3>Recent proof logs</h3>
          <ul>
            {(dashboard.compliance?.recent_logs || []).map((log) => (
              <li key={log.id}>{log.summary}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
