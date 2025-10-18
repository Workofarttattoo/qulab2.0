export default function IdeaTable({ ideas }) {
  if (!ideas?.length) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Top-10 Board Picks</h2>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Idea</th>
              <th>ROI %</th>
              <th>Risk %</th>
              <th>Confidence</th>
              <th>Capital</th>
              <th>Timeframe</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => (
              <tr key={idea.id}>
                <td>
                  <div className="idea-title">{idea.title}</div>
                  <p className="idea-desc">{idea.description}</p>
                </td>
                <td>{idea.projected_roi.toFixed(1)}</td>
                <td>{(idea.risk_score * 100).toFixed(0)}</td>
                <td>{(idea.confidence * 100).toFixed(0)}%</td>
                <td>${idea.capital_required.toLocaleString()}</td>
                <td>{idea.timeframe_months} mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
