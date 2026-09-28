import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

export default function RequestTable({ requests = [] }) {
  const navigate = useNavigate();

  if (!requests.length) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center sm:p-10"><p className="text-sm text-slate-500">No API requests found.</p></div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[760px] w-full">
          <thead className="bg-slate-50"><tr>
            {['Request ID','API Name','Provider','Status','Created','Action'].map((label, i) => (
              <th key={label} className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${i === 5 ? 'text-right' : ''}`}>{label}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.requestId || request.id} className="hover:bg-slate-50">
                <td className="break-all px-5 py-4 text-sm font-medium text-blue-600">{request.requestId || request.id || '-'}</td>
                <td className="max-w-[220px] break-words px-5 py-4 text-sm text-slate-700">{request.apiName || '-'}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{request.provider || '-'}</td>
                <td className="px-5 py-4"><StatusBadge status={request.status} /></td>
                <td className="px-5 py-4 text-sm text-slate-500">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => navigate(`/requests/${request.requestId || request.id}`)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"><Eye size={16} />View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {requests.map((request) => (
          <div key={request.requestId || request.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Request ID</p>
                <p className="mt-1 break-all text-sm font-semibold text-blue-600">{request.requestId || request.id || '-'}</p>
              </div>
              <div className="shrink-0"><StatusBadge status={request.status} /></div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">API Name</p><p className="mt-1 break-words text-sm font-medium text-slate-700">{request.apiName || '-'}</p></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Provider</p><p className="mt-1 break-words text-sm text-slate-600">{request.provider || '-'}</p></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Created</p><p className="mt-1 text-sm text-slate-600">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}</p></div>
            </div>
            <button type="button" onClick={() => navigate(`/requests/${request.requestId || request.id}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"><Eye size={16} />View Request</button>
          </div>
        ))}
      </div>
    </div>
  );
}
