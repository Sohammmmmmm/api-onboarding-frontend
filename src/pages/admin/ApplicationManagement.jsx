import { useEffect, useState } from "react";
import { Smartphone, Layers, Search, Eye } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getAdminApplications } from "../../services/adminService";

export default function ApplicationManagement() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await getAdminApplications();
        setApps(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.owner || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading Applications..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Application Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of consumer applications registered across all makers.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search app or owner..."
            className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Application Name</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed APIs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => (
                <tr key={app.id || app.applicationId} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-700">{app.applicationId || app.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{app.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{app.owner || "Soham"}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {app.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{app.apiCount || 3} API(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
