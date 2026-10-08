import { useEffect, useState } from "react";
import { Bell, Check, Save } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getNotificationMatrix, updateNotificationMatrix } from "../../services/adminService";

export default function NotificationConfiguration() {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadMatrix = async () => {
    try {
      const data = await getNotificationMatrix();
      setMatrix(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const toggleEventChannel = (index, channel) => {
    setMatrix((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [channel]: !copy[index][channel],
      };
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback("");
    try {
      await updateNotificationMatrix(matrix);
      setFeedback("Notification matrix preferences updated successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading Notification Matrix..." />;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Notification Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System notification event matrix for Email, SMS, and In-App alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Save size={15} />
          <span>{saving ? "Saving..." : "Save Event Matrix"}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback("")} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4 text-center">Email</th>
                <th className="py-3 px-4 text-center">SMS</th>
                <th className="py-3 px-4 text-center">In-App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.event}</td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(row.email)}
                      onChange={() => toggleEventChannel(idx, "email")}
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(row.sms)}
                      onChange={() => toggleEventChannel(idx, "sms")}
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(row.inApp)}
                      onChange={() => toggleEventChannel(idx, "inApp")}
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
