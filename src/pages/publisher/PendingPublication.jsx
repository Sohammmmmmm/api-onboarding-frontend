import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Send, Search } from "lucide-react";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import { getPublisherApis } from "../../services/publisherService";

export default function PendingPublication() {
  const navigate = useNavigate();
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadApis = async () => {
      try {
        const data = await getPublisherApis("PENDING_PUBLICATION");
        setApis(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadApis();
  }, []);

  const filtered = apis.filter(
    (a) =>
      a.apiName.toLowerCase().includes(search.toLowerCase()) ||
      a.provider.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading Pending Publications..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
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
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Pending Publication</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              APIs approved by Checker awaiting final Publisher review & publication.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search API or Provider..."
            className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No APIs currently pending publication.
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
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Environment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apiItem) => (
                  <tr key={apiItem.id || apiItem.apiId} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{apiItem.apiName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{apiItem.provider}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{apiItem.version || "v1.0"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{apiItem.createdBy || "Checker"}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {apiItem.createdAt ? new Date(apiItem.createdAt).toLocaleString() : "Today"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {apiItem.environment || "UAT"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="PENDING_PUBLICATION" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/publisher/apis/${apiItem.id || apiItem.apiId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition"
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
