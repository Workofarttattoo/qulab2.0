export default function JuryResults({ results }) {
  if (!results) return null;
  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Quantum Jury Narratives</h2>
      </div>
      {Object.entries(results.strategies || {}).map(([strategy, data]) => (
        <div key={strategy} className="card">
          <h3>Strategy {strategy}</h3>
          <ul>
            {(data.narratives || []).map((thought, index) => (
              <li key={index}>
                <strong>Juror {index + 1}:</strong> {thought} (Score {data.sentiments?.[index] ?? "?"})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
