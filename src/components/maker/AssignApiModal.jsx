import { useEffect, useState } from "react";
import { X, Layers, Server, Code, CheckCircle, Loader2 } from "lucide-react";
import { getApiCatalogue } from "../../services/catalogueService";
import { getEnvironments } from "../../services/masterService";
import { subscribeApi } from "../../services/applicationService";

export default function AssignApiModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}) {
  const [apis, setApis] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    apiId: "",
    environment: "",
    version: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const loadFormData = async () => {
      setLoadingData(true);
      setError("");
      setSuccessMsg("");
      try {
        const [catData, envData] = await Promise.all([
          getApiCatalogue(),
          getEnvironments(),
        ]);
        
        const catList = Array.isArray(catData) ? catData : catData?.content || [];
        const publishedOnly = catList.filter((a) =>
          String(a.status).toUpperCase() === "PUBLISHED"
        );
        setApis(publishedOnly);

        const envList = Array.isArray(envData) ? envData : envData?.content || [];
        setEnvironments(envList);
        if (publishedOnly.length === 0) {
          setError("No published APIs are available to assign.");
        } else if (envList.length === 0) {
          setError("No environments are configured.");
        }
        
        if (publishedOnly.length > 0 && envList.length > 0) {
          setForm((prev) => ({
            ...prev,
            apiId: publishedOnly[0].id || publishedOnly[0].apiId,
            environment: envList[0].id,
            version: publishedOnly[0].version || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load assign options:", err);
        setError("Unable to load available APIs or Environments.");
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedApiObj = apis.find((a) => (a.id || a.apiId) === form.apiId);

  const handleApiChange = (e) => {
    const selectedId = e.target.value;
    const apiObj = apis.find((a) => (a.id || a.apiId) === selectedId);
    setForm((prev) => ({
      ...prev,
      apiId: selectedId,
      version: apiObj?.version || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.apiId) {
      setError("Please select a published API.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const appId = application?.id || application?.applicationId;
      if (!appId) throw new Error("Application ID is unavailable.");
      await subscribeApi(appId, {
        apiId: form.apiId,
        environment: form.environment,
        version: form.version,
      });

      const appName = application?.name || "Not available";
      const msg = `API successfully assigned to ${appName}.`;
      setSuccessMsg(msg);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to assign API subscription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="glass-strong relative w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assign API to Application</h2>
            <p className="text-xs text-slate-500">
              Target App: <strong className="text-slate-800">{application?.name || "Not available"}</strong>
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-blue-600" />
            <span>Loading Published APIs & Environments…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select API */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select API <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.apiId}
                onChange={handleApiChange}
                required
                disabled={apis.length === 0 || environments.length === 0}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {apis.length === 0 ? (
                  <option value="">No published APIs available</option>
                ) : (
                  apis.map((apiItem) => (
                    <option key={apiItem.id || apiItem.apiId} value={apiItem.id || apiItem.apiId}>
                      {apiItem.apiName} ({apiItem.provider || "Core"})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Select Environment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Environment <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.environment}
                onChange={(e) => setForm((prev) => ({ ...prev, environment: e.target.value }))}
                required
                disabled={environments.length === 0}
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select an environment</option>
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.displayName || env.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Version */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Version <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
                required
                placeholder="Enter API version"
                className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || apis.length === 0 || environments.length === 0}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {submitting ? "Assigning..." : "Assign / Subscribe"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
