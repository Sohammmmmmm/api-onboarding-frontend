import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Smartphone, Globe, Plus, Layers, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getApplications, createApplication } from "../../services/applicationService";
import AssignApiModal from "../../components/maker/AssignApiModal";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [creating, setCreating] = useState("");

  const loadApps = async () => {
    try {
      const data = await getApplications();
      setApplications(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleOpenAssign = (app) => {
    setSelectedApp(app);
    setShowAssignModal(true);
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    setCreating(true);
    try {
      await createApplication({ name: newAppName.trim() });
      setNewAppName("");
      setShowCreateModal(false);
      await loadApps();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader text="Loading My Applications..." />;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage consumer applications and assign published APIs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>New Application</span>
        </button>
      </div>

      {/* Applications Grid */}
      {applications.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-slate-200">
          <Smartphone size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Applications Found</h3>
          <p className="text-xs text-slate-500 mt-1">Register your first consumer application to assign APIs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {applications.map((app) => (
            <div
              key={app.id || app.applicationId}
              className="glass rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    {(app.name || "").toLowerCase().includes("web") || (app.name || "").toLowerCase().includes("internet") ? (
                      <Globe size={20} />
                    ) : (
                      <Smartphone size={20} />
                    )}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {app.applicationId || app.id}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900">{app.name || "Not available"}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Owner: {app.owner || "Not available"}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-600" />
                    <span>{app.apiCount || 0} Subscribed APIs</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {app.status || "Not available"}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/applications/${app.id || app.applicationId}`}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>View APIs</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenAssign(app)}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Assign API</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign API Modal */}
      {showAssignModal && selectedApp && (
        <AssignApiModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          application={selectedApp}
          onSuccess={loadApps}
        />
      )}

      {/* Create Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="glass-strong relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white">
            <h3 className="text-base font-bold text-slate-900 mb-3">Register New Application</h3>
            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application Name *</label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. Corporate Web Portal"
                  required
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {creating ? "Creating..." : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
