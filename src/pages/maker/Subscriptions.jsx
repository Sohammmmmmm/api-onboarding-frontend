import { KeyRound, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import { getSubscriptions } from "../../services/subscriptionService";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const response = await getSubscriptions();
        setSubscriptions(Array.isArray(response) ? response : response?.content || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load subscriptions.");
      } finally {
        setLoading(false);
      }
    };
    loadSubscriptions();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">My Subscriptions</h1>
        <p className="mt-1 text-sm text-slate-500">View APIs you have successfully subscribed to.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4">{error}</div>}

      {!subscriptions.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <KeyRound size={40} className="mx-auto text-slate-300" />
          <h3 className="mt-4 font-semibold text-slate-700">No subscriptions found</h3>
          <p className="mt-1 text-sm text-slate-500">Your subscribed APIs will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <div key={subscription.subscriptionId || subscription.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="shrink-0 rounded-lg bg-blue-100 p-3 text-blue-600"><KeyRound size={20} /></div>
                <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">{subscription.status || "ACTIVE"}</span>
              </div>

              <h3 className="mt-5 break-words text-lg font-semibold text-slate-800">{subscription.apiName || "-"}</h3>
              <p className="mt-1 break-words text-sm text-slate-500">{subscription.provider || "-"}</p>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-400">Subscription ID</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">{subscription.subscriptionId || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Client ID</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-700">{subscription.clientId || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Environment</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{subscription.environment || "-"}</p>
                </div>
              </div>

              {subscription.endpointUrl && (
                <a href={subscription.endpointUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-blue-600 hover:text-blue-700">
                  <span className="break-all">API Endpoint</span><ExternalLink size={14} className="shrink-0" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
