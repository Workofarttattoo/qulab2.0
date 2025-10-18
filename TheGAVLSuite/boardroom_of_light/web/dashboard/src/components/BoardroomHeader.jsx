export default function BoardroomHeader({ corporation, onRefresh }) {
  return (
    <div className="boardroom-header">
      <div>
        <h1>🏗️ Blank Business Builder</h1>
        {corporation ? (
          <p className="subtitle">
            {corporation.name} — {corporation.region || "Region TBD"}
          </p>
        ) : (
          <p className="subtitle">Launch an autonomous corporation in minutes.</p>
        )}
      </div>
      {corporation && (
        <button className="secondary" onClick={onRefresh}>
          Refresh Dashboard
        </button>
      )}
    </div>
  );
}
