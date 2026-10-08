import { useEffect, useState } from "react";
import { Clock, Save, CheckCircle2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getSlaConfiguration, updateSlaConfiguration } from "../../services/adminService";

export default function SlaConfiguration() {
  const [sla, setSla] = useState({
    checkerReviewHours: 4,
    makerClarificationHours: 24,
    publisherReviewHours: 8,
    subscriptionProcessingHours: 4,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadSla = async () => {
    try {
      const data = await getSlaConfiguration();
      if (data) setSla(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSla();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSla((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback("");
    try {
      await updateSlaConfiguration(sla);
      setFeedback("SLA configuration saved successfully via backend API.");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading SLA Configuration..." />;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 font-sans pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">SLA Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure maximum turnaround hours for workflow stages. Backend calculates SLA compliance authoritatively.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback("")} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="glass rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock size={18} className="text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">Workflow Target SLA Thresholds</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Checker Review (Hours)</label>
            <input
              type="number"
              name="checkerReviewHours"
              value={sla.checkerReviewHours}
              onChange={handleChange}
              min={1}
              required
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">SLA for Checker to approve or request clarification.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Maker Clarification (Hours)</label>
            <input
              type="number"
              name="makerClarificationHours"
              value={sla.makerClarificationHours}
              onChange={handleChange}
              min={1}
              required
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">SLA for Maker to answer Checker query.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Publisher Review (Hours)</label>
            <input
              type="number"
              name="publisherReviewHours"
              value={sla.publisherReviewHours}
              onChange={handleChange}
              min={1}
              required
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">SLA for Publisher to review and publish API.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Subscription Processing (Hours)</label>
            <input
              type="number"
              name="subscriptionProcessingHours"
              value={sla.subscriptionProcessingHours}
              onChange={handleChange}
              min={1}
              required
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">SLA for application subscription credential generation.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
