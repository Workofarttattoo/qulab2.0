export default function DoNowCards({ ideas }) {
  if (!ideas?.length) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Top-5 DO-NOW Plays</h2>
      </div>
      <div className="cards">
        {ideas.map((idea) => (
          <article key={idea.id} className="card">
            <h3>{idea.title}</h3>
            <p>{idea.description}</p>
            <dl>
              <div>
                <dt>Risk</dt>
                <dd>{(idea.risk_score * 100).toFixed(0)}%</dd>
              </div>
              <div>
                <dt>ROI</dt>
                <dd>{idea.projected_roi.toFixed(1)}%</dd>
              </div>
              <div>
                <dt>Capital</dt>
                <dd>${idea.capital_required.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Timeframe</dt>
                <dd>{idea.timeframe_months} mo</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
