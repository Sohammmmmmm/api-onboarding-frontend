import { useEffect, useState } from "react";
import { FileText, Filter, Search } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getAdminAuditLogs } from "../../services/adminService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await getAdminAuditLogs();
        setLogs(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (roleFilter && log.role !== roleFilter) return false;
    if (
      search &&
      !log.actor.toLowerCase().includes(search.toLowerCase()) &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !log.details.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  if (loading) return <Loader text="Loading Audit Logs..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Audit Logs & Governance Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete immutable log of all workflow actions, status changes, and administrative operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Actor, Action, Details..."
              className="h-9 w-48 sm:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-rose-500"
          >
            <option value="">All Roles</option>
            <option value="MAKER">MAKER</option>
            <option value="CHECKER">CHECKER</option>
            <option value="PUBLISHER">PUBLISHER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Old Status</th>
                <th className="py-3 px-4">New Status</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {row.timestamp ? new Date(row.timestamp).toLocaleString() : "Today"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.actor}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {row.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{row.entity}</td>
                  <td className="py-3.5 px-4 font-semibold text-rose-700">{row.action}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{row.oldStatus || "—"}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 font-mono text-[11px]">{row.newStatus}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
