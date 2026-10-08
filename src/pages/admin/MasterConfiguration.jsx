import { useEffect, useState } from "react";
import { Settings, CheckCircle2, Plus, Edit2 } from "lucide-react";
import Loader from "../../components/common/Loader";
import {
  getEnvironments,
  getEnvironmentAliases,
  getCategories,
  getAuthTypes,
  getApplicationTypes,
} from "../../services/masterService";

export default function MasterConfiguration() {
  const [activeTab, setActiveTab] = useState("environment");

  const [environments, setEnvironments] = useState([]);
  const [aliases, setAliases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authTypes, setAuthTypes] = useState([]);
  const [appTypes, setAppTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [envs, als, cats, auths, apps] = await Promise.all([
          getEnvironments(),
          getEnvironmentAliases(),
          getCategories(),
          getAuthTypes(),
          getApplicationTypes(),
        ]);
        setEnvironments(Array.isArray(envs) ? envs : envs?.content || []);
        setAliases(Array.isArray(als) ? als : als?.content || []);
        setCategories(Array.isArray(cats) ? cats : cats?.content || []);
        setAuthTypes(Array.isArray(auths) ? auths : auths?.content || []);
        setAppTypes(Array.isArray(apps) ? apps : apps?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMaster();
  }, []);

  if (loading) return <Loader text="Loading Master Configuration..." />;

  const tabs = [
    { id: "environment", label: "Environment" },
    { id: "aliases", label: "Environment Aliases" },
    { id: "categories", label: "API Categories" },
    { id: "authTypes", label: "Authentication Types" },
    { id: "appTypes", label: "Application Types" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Master Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend master metadata configuration tables for environments, aliases, and categories.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-rose-600 text-rose-700 bg-rose-50/50 rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="glass rounded-2xl border border-slate-200 p-6 shadow-xs">
        {activeTab === "environment" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Canonical Name</th>
                  <th className="py-3 px-4">Display Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Aliases</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {environments.map((env) => (
                  <tr key={env.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{env.id}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{env.displayName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {env.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {Array.isArray(env.aliases) ? env.aliases.join(", ") : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert("Environment edit supported via backend API.")}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "aliases" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Canonical Name</th>
                  <th className="py-3 px-4">Alias String</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aliases.map((al, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{al.canonical}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{al.alias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">API Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "authTypes" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Authentication Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {authTypes.map((auth, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800">
                  {auth}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "appTypes" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Application Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {appTypes.map((app, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800">
                  {app}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
