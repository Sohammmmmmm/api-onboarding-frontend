import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  FileText,
  Layers,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Settings,
  RefreshCw,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import { getAdminDashboardStats } from "../../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingChecker: 0,
    clarifications: 0,
    approved: 0,
    rejected: 0,
    pendingPublication: 0,
    publishedApis: 0,
    applications: 0,
    activeSubscriptions: 0,
    slaBreaches: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader text="Loading Admin Dashboard..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Admin Governance Control Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              SYSTEM ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central governance overview, workflow configuration, user management, and system audit log metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw size={14} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Grid of 10 Cards (Requirement 21) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          onClick={() => navigate("/admin/audit")}
          className="glass rounded-2xl p-4 border border-blue-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-blue-600 block">Total Requests</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRequests}</p>
          <p className="text-[11px] text-blue-700 font-medium mt-1">Across all roles</p>
        </div>

        <div
          onClick={() => navigate("/admin/audit?status=PENDING_REVIEW")}
          className="glass rounded-2xl p-4 border border-yellow-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-yellow-600 block">Pending Checker</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingChecker}</p>
          <p className="text-[11px] text-yellow-700 font-medium mt-1">Review Queue</p>
        </div>

        <div
          onClick={() => navigate("/admin/audit?status=CLARIFICATION_REQUIRED")}
          className="glass rounded-2xl p-4 border border-orange-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-orange-600 block">Clarification Required</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.clarifications}</p>
          <p className="text-[11px] text-orange-700 font-medium mt-1">Maker Response Needed</p>
        </div>

        <div
          onClick={() => navigate("/admin/audit?status=APPROVED")}
          className="glass rounded-2xl p-4 border border-emerald-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Approved</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.approved}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Checker Validated</p>
        </div>

        <div
          onClick={() => navigate("/admin/audit?status=REJECTED")}
          className="glass rounded-2xl p-4 border border-rose-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-rose-600 block">Rejected</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.rejected}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Non-compliant</p>
        </div>

        <div
          onClick={() => navigate("/admin/catalogue?status=PENDING_PUBLICATION")}
          className="glass rounded-2xl p-4 border border-amber-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending Publication</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingPublication}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Publisher Queue</p>
        </div>

        <div
          onClick={() => navigate("/admin/catalogue")}
          className="glass rounded-2xl p-4 border border-teal-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-teal-600 block">Published APIs</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.publishedApis}</p>
          <p className="text-[11px] text-teal-700 font-medium mt-1">Active Catalogue</p>
        </div>

        <div
          onClick={() => navigate("/admin/applications")}
          className="glass rounded-2xl p-4 border border-purple-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-purple-600 block">Applications</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.applications}</p>
          <p className="text-[11px] text-purple-700 font-medium mt-1">Registered Apps</p>
        </div>

        <div
          onClick={() => navigate("/admin/applications")}
          className="glass rounded-2xl p-4 border border-indigo-200/80 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-indigo-600 block">Active Subscriptions</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeSubscriptions}</p>
          <p className="text-[11px] text-indigo-700 font-medium mt-1">Provisioned Keys</p>
        </div>

        <div
          onClick={() => navigate("/admin/sla")}
          className="glass rounded-2xl p-4 border border-rose-300 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
        >
          <span className="text-[10px] uppercase font-bold text-rose-600 block">SLA Breaches</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.slaBreaches}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Action Required</p>
        </div>
      </div>

      {/* Admin Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="glass rounded-2xl p-5 border border-slate-200 hover:border-blue-400 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">User Management</h3>
              <p className="text-xs text-slate-500">Manage Maker, Checker, Publisher & Admin roles</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/admin/master-configuration"
          className="glass rounded-2xl p-5 border border-slate-200 hover:border-purple-400 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition">Master Configuration</h3>
              <p className="text-xs text-slate-500">Manage Environments, Aliases & Categories</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/admin/sla"
          className="glass rounded-2xl p-5 border border-slate-200 hover:border-amber-400 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">SLA Configuration</h3>
              <p className="text-xs text-slate-500">Configure workflow SLA targets</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/admin/audit"
          className="glass rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">Audit Logs</h3>
              <p className="text-xs text-slate-500">Review full audit trail & timeline</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}
