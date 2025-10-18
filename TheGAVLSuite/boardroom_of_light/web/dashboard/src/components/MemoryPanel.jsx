export default function MemoryPanel({ memories, onUpload }) {
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onUpload(file);
    event.target.value = "";
  };

  const items = memories?.items || [];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Memory System</h2>
        <label className="upload">
          <input type="file" onChange={handleUpload} />
          Upload artifact
        </label>
      </div>
      <div className="memories">
        {!items.length && <p>No uploads yet. Drop proof to activate memory.</p>}
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.filename}</strong>
                <span>{item.category}</span>
              </div>
              <time>{new Date(item.uploaded_at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
