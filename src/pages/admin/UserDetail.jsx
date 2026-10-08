import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, ShieldCheck, Bell, Save, CheckCircle2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import {
  getAdminUser,
  updateUserRole,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from "../../services/adminService";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadUser = async () => {
    try {
      const [u, p] = await Promise.all([
        getAdminUser(userId),
        getUserNotificationPreferences(userId),
      ]);
      setUserData(u);
      setPrefs(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleRoleChange = async (newRole) => {
    setSavingRole(true);
    setFeedback("");
    try {
      await updateUserRole({ userId, role: newRole });
      setFeedback(`User role changed to ${newRole}.`);
      await loadUser();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRole(false);
    }
  };

  const togglePref = (eventKey, channel) => {
    setPrefs((prev) => ({
      ...prev,
      [eventKey]: {
        ...prev[eventKey],
        [channel]: !prev[eventKey]?.[channel],
      },
    }));
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    setFeedback("");
    try {
      await updateUserNotificationPreferences(userId, prefs);
      setFeedback("Notification preferences saved successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) return <Loader text="Loading User details..." />;
  if (!userData) return <div className="p-8 text-center">User not found.</div>;

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
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{userData.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Username: <strong className="text-slate-800">{userData.username || userData.id}</strong> &bull; Email: <strong className="text-slate-800">{userData.email}</strong>
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 self-start sm:self-auto">
          {userData.role}
        </span>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback("")} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Role Management Card */}
      <div className="glass rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-rose-600" />
          <span>Change User Role</span>
        </h2>

        <p className="text-xs text-slate-500">
          Click any role button below to instantly trigger the backend role update API.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {["MAKER", "CHECKER", "PUBLISHER", "ADMIN"].map((r) => {
            const isCurrent = userData.role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                disabled={savingRole || isCurrent}
                className={`p-3.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                  isCurrent
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {r} {isCurrent ? "(Current)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Preferences Toggles */}
      <div className="glass rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <span>Notification Preferences</span>
          </h2>

          <button
            type="button"
            onClick={handleSavePrefs}
            disabled={savingPrefs}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            <span>{savingPrefs ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>

        {prefs && (
          <div className="space-y-4 pt-1">
            {[
              { key: "clarificationRequired", label: "Clarification Required" },
              { key: "apiPublished", label: "API Published" },
              { key: "slaBreach", label: "SLA Breach" },
            ].map((evt) => (
              <div
                key={evt.key}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <span className="font-bold text-slate-800">{evt.label}</span>

                <div className="flex items-center gap-4">
                  {["email", "sms", "inApp"].map((ch) => {
                    const isChecked = Boolean(prefs[evt.key]?.[ch]);
                    return (
                      <label key={ch} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePref(evt.key, ch)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="capitalize font-semibold text-slate-600">
                          {ch === "inApp" ? "In-App" : ch}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
