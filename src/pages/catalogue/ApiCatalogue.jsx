import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  Plus,
  Filter,
  CheckCircle,
  ExternalLink,
  Code,
  Shield,
  Zap,
  Server,
  BookOpen,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Building2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { getApiCatalogue, getApiById, createApi } from "../../services/catalogueService";
import { getAllSubscriptions } from "../../services/subscriptionService";
import { useAuth } from "../../auth/AuthProvider";

export default function ApiCatalogue() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isChecker = user?.role === "CHECKER";

  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [visibleCredentials, setVisibleCredentials] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedApiDetails, setSelectedApiDetails] = useState(null);

  // Create API Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    apiName: searchParams.get("name") || "",
    category: "Core Banking",
    provider: searchParams.get("provider") || "Core Banking",
    version: "v1.0",
    baseUrl: "https://api.nishkaiv.com/gateway/v1",
    authType: "OAuth2 (Client Credentials)",
    rateLimit: "1,000 req/min",
    description: "",
    endpoints: [
      { method: "GET", path: "/details", summary: "Query record details" },
      { method: "POST", path: "/process", summary: "Execute transaction" },
    ],
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadCatalogue = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getApiCatalogue(filters);
      setCatalogue(data || []);
      setCatalogueError("");
    } catch (e) {
      console.error(e);
      setCatalogue([]);
      setCatalogueError("The API catalogue could not be loaded. Check the catalogue service and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filters = {
      search: search.trim(),
      category: selectedCategory === "ALL" ? undefined : selectedCategory,
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
    };
    const timer = setTimeout(() => loadCatalogue(filters), 300);
    if (isChecker && searchParams.get("newApi") === "true") {
      setShowCreateModal(true);
    }
    return () => clearTimeout(timer);
  }, [searchParams, isChecker, search, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (!isChecker) return undefined;
    let active = true;
    getAllSubscriptions()
      .then((items) => {
        if (active) setSubscriptions(items);
      })
      .catch((error) => console.error("Unable to load API credentials:", error));
    return () => {
      active = false;
    };
  }, [isChecker]);

  const handleApiSelect = async (apiItem) => {
    setSelectedApiDetails(apiItem);
    try {
      const details = await getApiById(apiItem.id || apiItem.apiId || apiItem.apiName);
      if (details) setSelectedApiDetails(details);
    } catch (error) {
      console.error("Unable to load API details:", error);
    }
  };

  const categories = [
    "ALL",
    "Core Banking",
    "Payments",
    "Account Services",
    "Lending",
    "Cards",
    "Customer Information",
  ];

  const filteredCatalogue = useMemo(() => {
    return catalogue.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory && item.provider !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const str = `${item.apiName} ${item.description} ${item.provider} ${item.baseUrl}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [catalogue, selectedCategory, selectedStatus, search]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.apiName.trim() || !createForm.description.trim()) {
      alert("Please provide API Name and Description.");
      return;
    }

    setCreateSubmitting(true);
    try {
      const newApi = await createApi(createForm);
      setShowCreateModal(false);
      setSuccessToast(`API "${newApi.apiName}" successfully registered to enterprise inventory!`);
      setTimeout(() => setSuccessToast(""), 4000);
      loadCatalogue();
    } catch (err) {
      console.error(err);
      alert("Failed to register API.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const selectedApiCredentials = selectedApiDetails
    ? subscriptions.filter((subscription) => {
        const selectedName = String(selectedApiDetails.apiName || selectedApiDetails.name || "").trim().toLowerCase();
        const subscriptionName = String(subscription.apiName || "").trim().toLowerCase();
        const selectedId = selectedApiDetails.id || selectedApiDetails.apiId;
        const sameId = selectedId && subscription.apiId && String(selectedId) === String(subscription.apiId);
        const sameName = selectedName && selectedName === subscriptionName;
        const selectedProvider = String(selectedApiDetails.provider || selectedApiDetails.providerName || "").trim().toLowerCase();
        const subscriptionProvider = String(subscription.provider || "").trim().toLowerCase();
        return (sameId || sameName) && (!selectedProvider || !subscriptionProvider || selectedProvider === subscriptionProvider);
      })
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#073b7a] via-[#094892] to-[#0877d1] rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white ring-2 ring-white/20">
              <Layers size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Enterprise API Inventory & Catalogue
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  Nishkaiv Solution Catalogue
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Explore existing bank APIs, check onboarded microservices, and register new API products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isChecker && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Register API</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-semibold block">Total Registered APIs</span>
            <span className="text-lg font-bold text-white">{catalogue.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-semibold block">Active Services</span>
            <span className="text-lg font-bold text-white">
              {catalogue.filter((a) => a.status === "ACTIVE").length}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-semibold block">Core Banking APIs</span>
            <span className="text-lg font-bold text-white">
              {catalogue.filter((a) => a.provider === "Core Banking").length}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {catalogueError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <span>{catalogueError}</span>
          <button
            type="button"
            onClick={() => loadCatalogue()}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={17} className="text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast("")} className="font-bold opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Search & Category Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by API name, provider, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BETA">Beta</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#073b7a] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* API Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalogue.length > 0 ? (
          filteredCatalogue.map((api) => (
            <div
              key={api.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100">
                      <Server size={17} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {api.provider || "Provider not specified"}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {api.apiName || "Unnamed API"}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {api.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {api.description}
                </p>

                {/* Tech Specs */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock size={12} className="text-slate-400" />
                      <span>Auth:</span>
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{api.authType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap size={12} className="text-slate-400" />
                      <span>Rate Limit:</span>
                    </span>
                    <span className="font-semibold text-slate-700">{api.rateLimit}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Code size={12} className="text-slate-400" />
                      <span>Version:</span>
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                      {api.version}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleApiSelect(api)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition"
                >
                  <BookOpen size={13} />
                  <span>View Endpoints</span>
                </button>

                {!isChecker ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/requests/new?apiName=${encodeURIComponent(api.apiName)}&provider=${encodeURIComponent(api.provider)}`
                      )
                    }
                    className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 transition"
                  >
                    <span>Request Access</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApiSelect(api)}
                    className="py-1.5 px-3 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-semibold text-xs flex items-center gap-1 transition"
                  >
                    <span>Specs</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
            <Layers size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No APIs found</h3>
            <p className="text-xs text-slate-500 mt-1">Try refining your search or category filter.</p>
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL: VIEW API SPECIFICATIONS & ENDPOINTS
         ========================================================= */}
      {selectedApiDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">API Details</h3>
                <p className="mt-0.5 text-xs text-slate-500">Complete catalogue specification</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApiDetails(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">API Name</span>
                <p className="mt-1 break-words text-sm font-bold text-slate-900">
                  {selectedApiDetails.apiName || selectedApiDetails.name || "Unnamed API"}
                </p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">Provider</span>
                <p className="mt-1 break-words text-sm font-bold text-slate-900">
                  {selectedApiDetails.provider || selectedApiDetails.providerName || "Provider not specified"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">Category</span>
                <p className="mt-1 text-xs font-semibold text-slate-800">{selectedApiDetails.category || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">Status / Version</span>
                <p className="mt-1 text-xs font-semibold text-slate-800">
                  {selectedApiDetails.status || "—"} / {selectedApiDetails.version || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">Authentication</span>
                <p className="mt-1 break-words text-xs font-semibold text-slate-800">{selectedApiDetails.authType || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">Rate Limit</span>
                <p className="mt-1 break-words text-xs font-semibold text-slate-800">{selectedApiDetails.rateLimit || "—"}</p>
              </div>
              {selectedApiDetails.updatedAt && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Last Updated</span>
                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {new Date(selectedApiDetails.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedApiDetails.description}</p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Base URL</span>
              <p className="text-blue-700 break-all">{selectedApiDetails.baseUrl}</p>
            </div>

            {/* Endpoints List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Available Endpoints
              </h4>
              <div className="space-y-2">
                {selectedApiDetails.endpoints?.map((ep, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === "GET"
                            ? "bg-blue-100 text-blue-800"
                            : ep.method === "POST"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">{ep.path}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{ep.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {isChecker && (
              <section className="space-y-2 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <KeyRound size={14} className="text-blue-600" />
                  <h4>Issued Credentials</h4>
                </div>
                {selectedApiCredentials.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No issued credentials found for this API.</p>
                ) : selectedApiCredentials.map((subscription, index) => {
                  const credentialKey = subscription.subscriptionId || subscription.requestId || `${selectedApiDetails.id}-${index}`;
                  const clientIdVisible = visibleCredentials[`${credentialKey}:clientId`];
                  const clientSecretVisible = visibleCredentials[`${credentialKey}:clientSecret`];
                  const renderCredential = (label, value, visible, field) => value && (
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-500">{label}</span>
                        <span className="block break-all font-mono text-xs text-slate-800">
                          {visible ? value : "••••••••••••"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVisibleCredentials((current) => ({ ...current, [`${credentialKey}:${field}`]: !current[`${credentialKey}:${field}`] }))}
                        className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200"
                        aria-label={`${visible ? "Hide" : "Show"} ${label}`}
                        title={`${visible ? "Hide" : "Show"} ${label}`}
                      >
                        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  );

                  return (
                    <div key={credentialKey} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[10px] text-slate-500">
                        <span>{subscription.subscriptionId || subscription.requestId || "Subscription"}</span>
                        {subscription.environment && <span>{subscription.environment}</span>}
                      </div>
                      <div className="space-y-2">
                        {renderCredential("Client ID", subscription.clientId, clientIdVisible, "clientId")}
                        {renderCredential("Client Secret", subscription.clientSecret, clientSecretVisible, "clientSecret")}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedApiDetails(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {!isChecker && (
                <button
                  type="button"
                  onClick={() => {
                    navigate(
                      `/requests/new?apiName=${encodeURIComponent(
                        selectedApiDetails.apiName
                      )}&provider=${encodeURIComponent(selectedApiDetails.provider)}`
                    );
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Request Onboarding Access
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE / REGISTER NEW API (PDF Sec 7 & User Req)
         ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-purple-700">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New API</h3>
                  <p className="text-xs text-slate-500">Publish a new API specification into the enterprise catalogue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  API Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Loan Valuation API"
                  value={createForm.apiName}
                  onChange={(e) => setCreateForm({ ...createForm, apiName: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Provider System <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={createForm.provider}
                    onChange={(e) => setCreateForm({ ...createForm, provider: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Core Banking">Core Banking</option>
                    <option value="Payment System">Payment System</option>
                    <option value="Account System">Account System</option>
                    <option value="Lending">Lending</option>
                    <option value="Cards">Cards</option>
                    <option value="CRM">CRM</option>
                    <option value="Customer Management">Customer Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Core Banking">Core Banking</option>
                    <option value="Payments">Payments</option>
                    <option value="Account Services">Account Services</option>
                    <option value="Lending">Lending</option>
                    <option value="Cards">Cards</option>
                    <option value="Customer Information">Customer Information</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={createForm.version}
                    onChange={(e) => setCreateForm({ ...createForm, version: e.target.value })}
                    placeholder="v1.0"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate Limit</label>
                  <input
                    type="text"
                    value={createForm.rateLimit}
                    onChange={(e) => setCreateForm({ ...createForm, rateLimit: e.target.value })}
                    placeholder="1,000 req/min"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base URL / Gateway Endpoint <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.baseUrl}
                  onChange={(e) => setCreateForm({ ...createForm, baseUrl: e.target.value })}
                  placeholder="https://api.nishkaiv.com/..."
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-mono outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authentication Type</label>
                <select
                  value={createForm.authType}
                  onChange={(e) => setCreateForm({ ...createForm, authType: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs outline-none focus:border-purple-500"
                >
                  <option value="OAuth2 (Client Credentials)">OAuth2 (Client Credentials)</option>
                  <option value="Mutual TLS + OAuth2">Mutual TLS + OAuth2</option>
                  <option value="API Key + Secret Hash">API Key + Secret Hash</option>
                  <option value="JWT Bearer Token">JWT Bearer Token</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description & Functional Scope <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Provide functional description of this API service..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {createSubmitting ? "Registering..." : "Save to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
