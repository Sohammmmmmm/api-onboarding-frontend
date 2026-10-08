import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Smartphone, Globe, ExternalLink, Eye, EyeOff, SlidersHorizontal, Plus, Layers } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getApplications, getApplicationSubscriptions } from "../../services/applicationService";
import AssignApiModal from "../../components/maker/AssignApiModal";

export default function Subscriptions() {
  const navigate = useNavigate();
  const [appsWithSubs, setAppsWithSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedApp, setSelectedApp] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [visibleClientIds, setVisibleClientIds] = useState({});
  const [visibleClientSecrets, setVisibleClientSecrets] = useState({});
  const [expandedSpecs, setExpandedSpecs] = useState({});

  const loadData = async () => {
    try {
      const apps = await getApplications();
      const appList = Array.isArray(apps) ? apps : apps?.content || [];

      const result = await Promise.all(
        appList.map(async (app) => {
          const subs = await getApplicationSubscriptions(app.id || app.applicationId);
          return {
            ...app,
            subscriptions: Array.isArray(subs) ? subs : subs?.content || [],
          };
        })
      );
      setAppsWithSubs(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load application subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = (app) => {
    setSelectedApp(app);
    setShowAssignModal(true);
  };

  if (loading) return <Loader text="Loading Subscriptions..." />;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My Subscriptions</h1>
          <p className="mt-1 text-xs text-slate-500">
            Application-aware API subscriptions and credentials management.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/applications")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Smartphone size={16} />
          <span>My Applications</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      {appsWithSubs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-slate-200">
          <KeyRound size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Subscriptions Found</h3>
          <p className="text-xs text-slate-500 mt-1">Your application API subscriptions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appsWithSubs.map((app) => (
            <div
              key={app.id || app.applicationId}
              className="glass rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              {/* Application Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{app.name}</h2>
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {app.applicationId || app.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Owner: <strong className="text-slate-800">{app.owner || "Soham"}</strong> &bull; Subscribed APIs: <strong className="text-blue-700">{app.subscriptions.length}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    to={`/applications/${app.id || app.applicationId}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Layers size={14} />
                    <span>View</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenAssign(app)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Assign API</span>
                  </button>
                </div>
              </div>

              {/* Subscriptions Cards for this App */}
              {app.subscriptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl">
                  No active API subscriptions assigned to {app.name}.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {app.subscriptions.map((sub) => {
                    const subKey = sub.id || sub.subscriptionId || sub.apiId;
                    const clientIdVisible = visibleClientIds[subKey];
                    const clientSecretVisible = visibleClientSecrets[subKey];
                    const specsExpanded = expandedSpecs[subKey];

                    return (
                      <div
                        key={subKey}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{sub.apiName || sub.apiId}</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Env: <strong className="text-blue-700">{sub.environment || "UAT"}</strong> &bull; {sub.version || "v1"}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                            {sub.status || "ACTIVE"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSpecs((prev) => ({ ...prev, [subKey]: !prev[subKey] }))
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <SlidersHorizontal size={13} />
                          <span>{specsExpanded ? "Hide Credentials" : "Show Credentials"}</span>
                        </button>

                        {specsExpanded && (
                          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                            {sub.clientId && (
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Client ID</span>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="font-mono text-slate-800 font-semibold break-all">
                                    {clientIdVisible ? sub.clientId : "••••••••••••"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setVisibleClientIds((p) => ({ ...p, [subKey]: !p[subKey] }))}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                  >
                                    {clientIdVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                              </div>
                            )}

                            {sub.clientSecret && (
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Client Secret</span>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="font-mono text-slate-800 font-semibold break-all">
                                    {clientSecretVisible ? sub.clientSecret : "••••••••••••"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setVisibleClientSecrets((p) => ({ ...p, [subKey]: !p[subKey] }))}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                  >
                                    {clientSecretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAssignModal && selectedApp && (
        <AssignApiModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          application={selectedApp}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
