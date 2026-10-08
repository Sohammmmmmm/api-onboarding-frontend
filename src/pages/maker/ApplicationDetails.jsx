import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Smartphone, Plus, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getApplication, getApplicationSubscriptions } from "../../services/applicationService";
import AssignApiModal from "../../components/maker/AssignApiModal";
import StatusBadge from "../../components/common/StatusBadge";

export default function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadData = async () => {
    try {
      const [appData, subsData] = await Promise.all([
        getApplication(applicationId),
        getApplicationSubscriptions(applicationId),
      ]);
      setApplication(appData);
      setSubscriptions(Array.isArray(subsData) ? subsData : subsData?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationId]);

  if (loading) return <Loader text="Loading Application details..." />;
  if (!application) return <div className="p-8 text-center">Application not found.</div>;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{application.name}</h1>
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {application.applicationId || application.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Owner: <strong className="text-slate-800">{application.owner || "Not available"}</strong> &bull; Status: <strong className="text-emerald-700">{application.status || "Not available"}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAssignModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Assign API</span>
        </button>
      </div>

      {/* Subscribed APIs Table */}
      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            <span>Subscribed APIs</span>
          </h2>
          <span className="text-xs text-slate-400">{subscriptions.length} active subscription(s)</span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No APIs subscribed to this application yet. Click &quot;Assign API&quot; above to subscribe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">API Name</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{sub.apiName || sub.apiId}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sub.environment || "Not available"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{sub.version || "Not available"}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>{sub.status || "Not available"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAssignModal && (
        <AssignApiModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          application={application}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
