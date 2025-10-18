import { useEffect, useMemo, useState } from "react";
import "./App.css";
import BoardroomHeader from "./components/BoardroomHeader.jsx";
import OnboardingWizard from "./components/OnboardingWizard.jsx";
import ResearchPanel from "./components/ResearchPanel.jsx";
import DoNowCards from "./components/DoNowCards.jsx";
import IdeaTable from "./components/IdeaTable.jsx";
import BusinessLockPanel from "./components/BusinessLockPanel.jsx";
import CompliancePanel from "./components/CompliancePanel.jsx";
import MemoryPanel from "./components/MemoryPanel.jsx";
import GovernancePanel from "./components/GovernancePanel.jsx";
import {
  createCorporation,
  listCorporations,
  getCorporation,
  updateOnboarding,
  startResearch,
  getResearch,
  lockBusiness,
  destroyLock,
  getCompliance,
  createComplianceLog,
  uploadMemory,
  listMemories,
  getDashboard,
  exportResearch,
} from "./api.js";

export default function App() {
  const [corporations, setCorporations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [onboarding, setOnboarding] = useState(null);
  const [research, setResearch] = useState(null);
  const [locked, setLocked] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [memories, setMemories] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [lockBusy, setLockBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newCorp, setNewCorp] = useState({ name: "", region: "" });

  const selectedCorporation = useMemo(
    () => corporations.find((corp) => corp.id === selectedId) || null,
    [corporations, selectedId],
  );

  const fetchCorporations = async () => {
    const data = await listCorporations();
    setCorporations(data);
    if (data.length && !selectedId) {
      setSelectedId(data[0].id);
    }
  };

  const hydrateSelected = async (corpId) => {
    if (!corpId) return;
    try {
      setLoading(true);
      const [corp, dash, comp, mem] = await Promise.all([
        getCorporation(corpId),
        getDashboard(corpId),
        getCompliance(corpId),
        listMemories(corpId),
      ]);
      setOnboarding(corp.onboarding);
      setLocked(corp.locked);
      setDashboard(dash);
      setCompliance(comp);
      setMemories(mem);
      try {
        const summary = await getResearch(corpId);
        setResearch(summary);
      } catch (err) {
        setResearch(null);
      }
    } catch (err) {
      setError("Unable to load corporation dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporations();
  }, []);

  useEffect(() => {
    if (selectedId) {
      hydrateSelected(selectedId);
    }
  }, [selectedId]);

  const handleCreateCorporation = async (event) => {
    event.preventDefault();
    if (!newCorp.name) return;
    try {
      setCreating(true);
      const corp = await createCorporation(newCorp);
      setNewCorp({ name: "", region: "" });
      await fetchCorporations();
      setSelectedId(corp.id);
    } catch (err) {
      setError("Failed to create corporation.");
    } finally {
      setCreating(false);
    }
  };

  const handleOnboardingSave = async (payload) => {
    try {
      setLoading(true);
      const status = await updateOnboarding(selectedId, payload);
      setOnboarding(status);
      await hydrateSelected(selectedId);
    } catch (err) {
      setError("Could not save onboarding status.");
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async (payload) => {
    try {
      setResearchLoading(true);
      const summary = await startResearch(selectedId, payload);
      setResearch(summary);
      await hydrateSelected(selectedId);
    } catch (err) {
      setError("Research engine failed to run. Complete onboarding first.");
    } finally {
      setResearchLoading(false);
    }
  };

  const handleLock = async (payload) => {
    try {
      setLockBusy(true);
      const result = await lockBusiness(selectedId, payload);
      setLocked(result);
      await hydrateSelected(selectedId);
    } catch (err) {
      setError("Unable to lock business. Destroy existing lock first.");
    } finally {
      setLockBusy(false);
    }
  };

  const handleDestroyLock = async () => {
    try {
      setLockBusy(true);
      await destroyLock(selectedId);
      await hydrateSelected(selectedId);
    } catch (err) {
      setError("No active business to destroy.");
    } finally {
      setLockBusy(false);
    }
  };

  const handleComplianceLog = async (payload) => {
    await createComplianceLog(selectedId, payload);
    const updated = await getCompliance(selectedId);
    setCompliance(updated);
  };

  const handleUpload = async (file) => {
    await uploadMemory(selectedId, file);
    const mem = await listMemories(selectedId);
    setMemories(mem);
  };

  const refreshDashboard = async () => {
    if (!selectedId) return;
    await hydrateSelected(selectedId);
  };

  return (
    <div className="app-shell">
      <BoardroomHeader corporation={selectedCorporation} onRefresh={refreshDashboard} />

      <div className="corporation-picker">
        <label>
          Active corporation
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">Select...</option>
            {corporations.map((corp) => (
              <option key={corp.id} value={corp.id}>
                {corp.name} {corp.region ? `(${corp.region})` : ""}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={handleCreateCorporation}>
          <input
            placeholder="New corp name"
            value={newCorp.name}
            onChange={(e) => setNewCorp({ ...newCorp, name: e.target.value })}
          />
          <input
            placeholder="Region"
            value={newCorp.region}
            onChange={(e) => setNewCorp({ ...newCorp, region: e.target.value })}
          />
          <button className="primary" type="submit" disabled={creating}>
            {creating ? "Launching..." : "Launch new corp"}
          </button>
        </form>
      </div>

      {error && <div className="panel danger">{error}</div>}

      {!selectedId && (
        <div className="empty-state">
          Spin up your first corporation or select one from the list to activate the boardroom.
        </div>
      )}

      {selectedId && (
        <div className="dashboard-grid">
          <GovernancePanel dashboard={dashboard} />
          <OnboardingWizard status={onboarding} onSave={handleOnboardingSave} loading={loading} />
          <ResearchPanel
            onGenerate={handleResearch}
            research={research}
            exportingUrl={exportResearch(selectedId)}
            loading={researchLoading}
          />
          <DoNowCards ideas={research?.top_five_do_now} />
          <IdeaTable ideas={research?.top_ten} />
          <BusinessLockPanel
            research={research}
            locked={locked}
            onLock={handleLock}
            onDestroy={handleDestroyLock}
            busy={lockBusy}
          />
          <CompliancePanel compliance={compliance} onLog={handleComplianceLog} />
          <MemoryPanel memories={memories} onUpload={handleUpload} />
        </div>
      )}
    </div>
  );
}
