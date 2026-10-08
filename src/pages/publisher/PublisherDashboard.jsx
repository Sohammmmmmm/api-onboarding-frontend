import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, CheckCircle2, AlertOctagon, Layers, Clock, ArrowRight, Eye, RefreshCw } from "lucide-react";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import SlaBadge from "../../components/common/SlaBadge";
import { getPublisherDashboardStats, getPublisherApis } from "../../services/publisherService";

export default function PublisherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingPublication: 0,
    publishedApis: 0,
    deprecatedApis: 0,
    retiredApis: 0,
    slaBreached: 0,
  });

  const [pendingApis, setPendingApis] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, apisData] = await Promise.all([
        getPublisherDashboardStats(),
        getPublisherApis("PENDING_PUBLICATION"),
      ]);
      setStats(statsData);
      setPendingApis(Array.isArray(apisData) ? apisData : apisData?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader text="Loading Publisher Dashboard..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Publisher Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              API GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review Checker-approved APIs and govern production publication lifecycle.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards Row (Requirement 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => navigate("/publisher/pending-publication")}
          className="glass rounded-2xl p-4 border border-amber-200/70 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending Publication</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingPublication}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Awaiting Review</p>
        </div>

        <div
          onClick={() => navigate("/publisher/published")}
          className="glass rounded-2xl p-4 border border-emerald-200/70 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Published APIs</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.publishedApis}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Live in Catalogue</p>
        </div>

        <div
          onClick={() => navigate("/publisher/published?status=DEPRECATED")}
          className="glass rounded-2xl p-4 border border-orange-200/70 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-orange-600 block">Deprecated APIs</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.deprecatedApis}</p>
          <p className="text-[11px] text-orange-700 font-medium mt-1">Phasing Out</p>
        </div>

        <div
          onClick={() => navigate("/publisher/published?status=RETIRED")}
          className="glass rounded-2xl p-4 border border-slate-200 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Retired APIs</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.retiredApis}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Inactive / Decommissioned</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-rose-200/70 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-600 block">SLA Breaches</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.slaBreached}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Requires Attention</p>
        </div>
      </div>

      {/* Pending Publication Table */}
      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">APIs Pending Publication</h2>
          </div>
          <Link
            to="/publisher/pending-publication"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {pendingApis.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No APIs pending publication review at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">API Name</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4">Checker Approval</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApis.map((apiItem) => (
                  <tr key={apiItem.id || apiItem.apiId} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{apiItem.apiName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{apiItem.provider}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{apiItem.version || "v1.0"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{apiItem.createdBy || "Checker Officer"}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {apiItem.checkerApprovalTime ? new Date(apiItem.checkerApprovalTime).toLocaleString() : "Today"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="PENDING_PUBLICATION" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/publisher/apis/${apiItem.id || apiItem.apiId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
