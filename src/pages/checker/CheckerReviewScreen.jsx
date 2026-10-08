import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  XCircle,
  Mail,
  Cpu,
  Paperclip,
  Building2,
  FileCheck,
  Send,
  Download,
  Eye,
  AlertTriangle,
  Layers,
  PlusCircle,
  Check,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  EyeOff,
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import {
  getCheckerRequestDetails,
  registerRequestApi,
  approveRequest,
  rejectRequest,
  requestClarification,
} from "../../services/checkerService";
import { checkApiMatch } from "../../services/catalogueService";
import { getAttachment } from "../../services/attachmentService";

export default function CheckerReviewScreen() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalogueMatch, setCatalogueMatch] = useState(null);
  const [checkingMatch, setCheckingMatch] = useState(true);
  const [catalogueCheckError, setCatalogueCheckError] = useState("");
  const [showClientId, setShowClientId] = useState(false);

  // Checker Remarks
  const [remarks, setRemarks] = useState("");

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form values in modals
  const [clarificationQuestion, setClarificationQuestion] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [registerForm, setRegisterForm] = useState(null);
  const [registeringApi, setRegisteringApi] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const findCatalogueMatch = async (apiName, provider) => {
    setCheckingMatch(true);
    setCatalogueCheckError("");
    setCatalogueMatch(null);
    try {
      const match = await checkApiMatch(apiName, provider);
      setCatalogueMatch(match || null);
    } catch (error) {
      console.error("Failed to verify API catalogue:", error);
      setCatalogueCheckError("Unable to verify the API catalogue. Retry before making a decision.");
    } finally {
      setCheckingMatch(false);
    }
  };

  const loadDetails = async (fallbackClientId) => {
    setLoading(true);
    try {
      const data = await getCheckerRequestDetails(requestId);
      if (data) {
        setRequest({ ...data, clientId: data.clientId || fallbackClientId });
        setRemarks(data.checkerRemarks || "");

        await findCatalogueMatch(data.apiName || data.requestedApi, data.provider);
      }
    } catch (e) {
      console.error("Failed to load details:", e);
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (file) => {
    try {
      const attachmentId = file.attachmentId || file.id;
      if (!attachmentId) throw new Error("Attachment ID is missing.");
      const blob = await getAttachment(requestId, attachmentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name || "attachment";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Attachment download failed:", error);
      alert("Unable to download this attachment.");
    }
  };

  const previewAttachment = async (file) => {
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      alert("Allow pop-ups to preview this attachment.");
      return;
    }

    try {
      const attachmentId = file.attachmentId || file.id;
      if (!attachmentId) throw new Error("Attachment ID is missing.");
      const blob = await getAttachment(requestId, attachmentId);
      previewWindow.location.href = URL.createObjectURL(blob);
    } catch (error) {
      previewWindow.close();
      console.error("Attachment preview failed:", error);
      alert("Unable to preview this attachment.");
    }
  };

  useEffect(() => {
    setShowClientId(false);
    loadDetails();
  }, [requestId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const catalogueApiId =
        catalogueMatch?.id || catalogueMatch?.apiId || catalogueMatch?.catalogueApiId;
      const approval = await approveRequest(requestId, {
        remarks: remarks.trim(),
        ...(catalogueApiId ? { catalogueApiId } : {}),
      });
      const approvalData = approval?.data?.data ?? approval?.data ?? approval;
      const clientId = approvalData?.clientId ?? approvalData?.subscription?.clientId ?? approvalData?.credentials?.clientId;
      setShowApproveModal(false);
      setFeedbackMessage({
        type: "success",
        title: "Request Approved Successfully",
        message: "API Subscription created. Client ID & credentials generated for Maker.",
      });
      loadDetails(clientId);
    } catch (e) {
      console.error(e);
      alert("Failed to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(true);
    try {
      await rejectRequest(requestId, {
        reason: [rejectionReason.trim(), remarks.trim()].filter(Boolean).join(" — "),
      });
      setShowRejectModal(false);
      setFeedbackMessage({
        type: "danger",
        title: "Request Rejected",
        message: "Maker notified with the specified reason.",
      });
      loadDetails();
    } catch (e) {
      console.error(e);
      alert("Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClarify = async () => {
    if (!clarificationQuestion.trim()) {
      alert("Please enter your clarification question for the Maker.");
      return;
    }
    setActionLoading(true);
    try {
      await requestClarification(requestId, {
        question: [clarificationQuestion.trim(), remarks.trim()].filter(Boolean).join("\n"),
      });
      setShowClarifyModal(false);
      setClarificationQuestion("");
      setFeedbackMessage({
        type: "warning",
        title: "Clarification Requested",
        message: "Request status updated to CLARIFICATION_REQUIRED. Maker alerted.",
      });
      loadDetails();
    } catch (e) {
      console.error(e);
      alert("Failed to submit clarification question.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRegisterModal = () => {
    setSelectedRequest(request);
    setRegisterForm({
      apiName: request.apiName || request.requestedApi || "",
      provider: request.provider || "",
      category: request.category || request.provider || "",
      version: request.version || request.apiVersion || "v1.0",
      rateLimit: request.rateLimit || "1,000 req/min",
      baseUrl: request.baseUrl || request.baseURL || request.base_url || "",
      authType: request.authType || request.authenticationType || "OAuth2 (Client Credentials)",
      description: request.description || request.businessJustification || request.reason || "",
    });
    setShowRegisterModal(true);
  };

  const handleRegisterApi = async (event) => {
    event.preventDefault();
    const selectedRequestId = selectedRequest?.requestId || selectedRequest?.requestID || selectedRequest?.id;
    if (!selectedRequestId || !registerForm) {
      alert("Select a Checker request before registering an API.");
      return;
    }

    setRegisteringApi(true);
    try {
      const payload = {
        apiName: registerForm.apiName.trim(),
        provider: registerForm.provider.trim(),
        category: registerForm.category.trim(),
        version: registerForm.version.trim(),
        rateLimit: registerForm.rateLimit.trim(),
        baseUrl: registerForm.baseUrl.trim(),
        authType: registerForm.authType.trim(),
        description: registerForm.description.trim(),
      };
      const result = await registerRequestApi(
        selectedRequestId,
        payload
      );
      const apiId = result?.apiId ?? result?.api_id ?? result?.id ?? "Not returned";
      const clientId = result?.clientId ?? result?.client_id ?? "Not returned";

      setShowRegisterModal(false);
      setFeedbackMessage({
        type: "success",
        title: "API Registered Successfully",
        message: `API ID: ${apiId} • Client ID: ${clientId}`,
      });
      await loadDetails(clientId === "Not returned" ? undefined : clientId);
    } catch (error) {
      console.error("API registration failed:", error);
      alert(error?.response?.data?.message || error?.message || "Failed to register API.");
    } finally {
      setRegisteringApi(false);
    }
  };

  if (loading) return <Loader text="Loading Request for Review..." />;
  if (!request) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
        <AlertTriangle size={40} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Unable to locate request with ID {requestId}.</p>
        <button
          type="button"
          onClick={() => navigate("/checker")}
          className="mt-4 px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isTerminal = ["APPROVED", "SUBSCRIBED", "REJECTED"].includes(request.status);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/checker" className="hover:text-purple-700 font-medium">
            API Requests
          </Link>
          <span>/</span>
          <Link to="/checker/requests" className="hover:text-purple-700 font-medium">
            Requests
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{request.requestId || request.id}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to List</span>
        </button>
      </div>

      {/* Feedback Banner if action performed */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : feedbackMessage.type === "danger"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <div>
              <p className="text-xs font-bold">{feedbackMessage.title}</p>
              <p className="text-[11px] opacity-90">{feedbackMessage.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card (PDF Page 31 & 37: Checker Review - API Request Details) */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 rounded-2xl border border-sky-100 p-5 text-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-blue-700 ring-1 ring-blue-100">
              <FileCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Checker Review – API Request Details
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Review the extracted details from the API onboarding request &bull; {request.requestId || request.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-blue-100 text-xs">
              <span className="text-slate-500 text-[10px] uppercase block">Current Status</span>
              <span className="font-bold text-slate-800">{request.status.replaceAll("_", " ")}</span>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Request Overview Summary Bar (PDF Page 37) */}
        <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Request ID</span>
            <span className="font-bold text-slate-800">{request.requestId || request.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Maker</span>
            <span className="font-semibold text-slate-800 truncate block">{request.maker || "User"}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Provider</span>
            <span className="font-semibold text-slate-800 truncate block">{request.provider}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Consumer</span>
            <span className="font-semibold text-slate-800 truncate block">{request.consumer}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Requested API</span>
            <span className="font-semibold text-slate-800 truncate block">{request.apiName || request.requestedApi}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Environment</span>
            <span className="font-semibold text-slate-800">{request.environment || "UAT"}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Request Info & AI Analysis & Email */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: Request Details (PDF Page 31 & 37) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Request Details</h3>
              </div>
              <span className="text-xs text-slate-400">
                Submitted on: {request.submittedOn ? new Date(request.submittedOn).toLocaleString() : "—"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Maker / Requester</span>
                <p className="font-semibold text-slate-800 text-sm">{request.maker || "User"}</p>
                <p className="text-slate-500 mt-0.5">{request.makerEmail || "user@nishkaiv.com"}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target API</span>
                <p className="font-semibold text-slate-800 text-sm">{request.apiName || request.requestedApi}</p>
                <p className="text-slate-500 mt-0.5">Provider: {request.provider} &bull; Env: {request.environment || "UAT"}</p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business Justification</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {request.businessJustification || request.reason || "No justification provided."}
                </p>
              </div>

              {request.apiRequirement && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">API Requirement Specifications</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-mono text-[11px]">
                    {request.apiRequirement}
                  </p>
                </div>
              )}

              {request.additionalInformation && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Additional Information</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {request.additionalInformation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: AI Extracted Information (PDF Page 21, 31, 37) */}
          {request.source?.toUpperCase() === "EMAIL" && (
          <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Cpu size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>AI Extracted Information</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                      LLM / SLM Model
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                <Sparkles size={12} className="text-indigo-600" />
                <span>Confidence: {request.aiExtractedInfo?.confidence || "98.4%"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                <span className="text-[10px] text-indigo-500 font-semibold uppercase block">Extracted API Name</span>
                <span className="font-bold text-slate-900">{request.aiExtractedInfo?.apiName || request.apiName}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                <span className="text-[10px] text-indigo-500 font-semibold uppercase block">Identified Provider</span>
                <span className="font-bold text-slate-900">{request.aiExtractedInfo?.apiProvider || request.provider}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                <span className="text-[10px] text-indigo-500 font-semibold uppercase block">Consumer Application</span>
                <span className="font-bold text-slate-900">{request.aiExtractedInfo?.consumerApplication || request.consumer}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                <span className="text-[10px] text-indigo-500 font-semibold uppercase block">Environment</span>
                <span className="font-bold text-slate-900">{request.aiExtractedInfo?.environment || request.environment || "UAT"}</span>
              </div>

              <div className="sm:col-span-2 p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100">
                <span className="text-[10px] text-indigo-500 font-semibold uppercase block">Business Justification Analysis</span>
                <span className="text-slate-800">
                  {request.aiExtractedInfo?.businessJustification || request.businessJustification}
                </span>
              </div>
            </div>
          </div>
          )}

          {/* Card 3: Original Email (PDF Page 14, 31, 37) */}
          {(request.source?.toUpperCase() === "EMAIL" || request.originalEmail) && <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Original Email (IMAP Retrieval)</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Received: {request.originalEmail?.receivedOn || "24 Sep 2026, 10:28 AM"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
                  <span className="font-semibold text-slate-800">{request.originalEmail?.from || request.makerEmail || "maker@nishkaiv.com"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">To</span>
                  <span className="font-semibold text-slate-800">{request.originalEmail?.to || "api-requests@nishkaiv.com"}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject</span>
                  <span className="font-bold text-slate-900">{request.originalEmail?.subject || "API Access Request - Customer Account API"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Body Snippet</span>
                <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-700">
                  {request.originalEmail?.body ||
                    `Dear Team,\n\nWe require access to the ${request.apiName || "API"} to integrate with our ${request.consumer || "application"}.\n\nPlease provide necessary access.\n\nRegards,\n${request.maker || "Maker"}`}
                </div>
              </div>
            </div>
          </div>}

        </div>

        {/* RIGHT COLUMN: Attachments and Catalogue Matcher */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 5: API Catalogue Matcher (PDF Section 7 & Pages 24, 26, 28) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">API Inventory Match</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Nishkaiv Solution Catalogue
              </span>
            </div>

            {checkingMatch ? (
              <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Checking the API catalogue...</p>
            ) : catalogueCheckError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <p>{catalogueCheckError}</p>
                <button
                  type="button"
                  onClick={() => findCatalogueMatch(request.apiName || request.requestedApi, request.provider)}
                  className="mt-2 font-semibold underline"
                >
                  Retry catalogue check
                </button>
              </div>
            ) : catalogueMatch ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>Existing API Found in Catalogue</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{catalogueMatch.apiName}</p>
                  <p className="text-[11px] text-slate-500">
                    Provider: {catalogueMatch.provider} &bull; {catalogueMatch.version}
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
                  <p>Auth: {catalogueMatch.authType}</p>
                  <p>Rate Limit: {catalogueMatch.rateLimit}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/checker/catalogue`)}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  View in API Inventory
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>API Not Found in Inventory</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  The requested API does not currently exist in the enterprise catalogue. As Checker, you can register it!
                </p>
                <p className="text-slate-600 text-[11px]">
                  Register this request directly from the Checker review screen.
                </p>
              </div>
            )}
          </div>

          {/* Card 6: Attachments (PDF Page 31 & 37) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Paperclip size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Attachments</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {request.attachments?.length || 0} file(s)
              </span>
            </div>

            {request.attachments && request.attachments.length > 0 ? (
              <div className="space-y-2">
                {request.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Paperclip size={14} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => previewAttachment(file)}
                        title="Preview attachment"
                        className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadAttachment(file)}
                        title="Download attachment"
                        className="h-7 w-7 flex items-center justify-center rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg">
                No files attached to this request.
              </p>
            )}
          </div>

        </div>
      </div>

      <div className="space-y-5">
        {/* Clarification history spans the page to avoid an empty lower column. */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <HelpCircle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clarification History & Queries</h3>
                <p className="text-[10px] text-slate-500">Dialogue between Checker and Maker</p>
              </div>
            </div>
            {!isTerminal && catalogueMatch && !checkingMatch && !catalogueCheckError && (
              <button
                type="button"
                onClick={() => setShowClarifyModal(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
              >
                + Ask Query
              </button>
            )}
          </div>
          {request.clarificationThread && request.clarificationThread.length > 0 ? (
            <div className="space-y-3">
              {request.clarificationThread.map((msg, index) => {
                const isCheckerMsg = msg.senderRole === "CHECKER";
                return (
                  <div
                    key={msg.id || index}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isCheckerMsg
                        ? "bg-slate-50 border-slate-200 text-slate-800"
                        : "bg-sky-50/70 border-sky-100 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${isCheckerMsg ? "bg-slate-500" : "bg-sky-500"}`} />
                        <span>{msg.sender || (isCheckerMsg ? "Checker" : "Maker")}</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 text-xs">
              <p>No clarification queries raised for this request yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                If any requirement is unclear, use the &quot;Request Clarification&quot; button below.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Checker Remarks</h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks (optional)..."
              disabled={isTerminal}
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition resize-none disabled:bg-slate-50"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Internal audit trail or notes visible during decision making.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Checker Decision Panel
            </h3>
            {!isTerminal ? (
              <div className="space-y-2.5">
                {(checkingMatch || catalogueCheckError) && (
                  <p className="text-center text-xs text-slate-500">
                    {checkingMatch ? "Checking the API catalogue before decisions..." : "Retry the catalogue check before approving or requesting clarification."}
                  </p>
                )}
                {!checkingMatch && !catalogueCheckError && (
                  <>
                    {catalogueMatch ? (
                      <button
                        type="button"
                        onClick={() => setShowApproveModal(true)}
                        className="w-full min-h-12 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                      >
                        <CheckCircle size={17} />
                        <span>Approve API Request</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openRegisterModal}
                        className="w-full min-h-12 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-800 font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
                      >
                        <PlusCircle size={17} />
                        <span>Register New API</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowClarifyModal(true)}
                      className="w-full min-h-12 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
                    >
                      <HelpCircle size={17} />
                      <span>Request Clarification</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="w-full min-h-12 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
                >
                  <XCircle size={16} />
                  <span>Reject Request</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Request is {request.status}</p>
                <p className="text-[11px] text-slate-400 mt-1">This request has reached a terminal status.</p>
                {request.clientId && (
                  <div className="mt-2 text-left bg-white p-2.5 rounded border border-emerald-200 font-mono text-[11px] text-emerald-800">
                    <p className="font-bold">Client ID:</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="break-all">{showClientId ? request.clientId : "••••••••••••"}</p>
                      <button
                        type="button"
                        onClick={() => setShowClientId((visible) => !visible)}
                        className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100"
                        title={showClientId ? "Hide Client ID" : "Show Client ID"}
                        aria-label={showClientId ? "Hide Client ID" : "Show Client ID"}
                      >
                        {showClientId ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}
                {request.rejectionReason && (
                  <div className="mt-2 text-left bg-white p-2.5 rounded border border-rose-200 text-[11px] text-rose-800">
                    <p className="font-bold">Rejection Reason:</p>
                    <p>{request.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRegisterModal && selectedRequest && registerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
          <form
            onSubmit={handleRegisterApi}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register API to Inventory</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Request: {selectedRequest.requestId || selectedRequest.requestID || selectedRequest.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                disabled={registeringApi}
                aria-label="Close API registration form"
                className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["apiName", "API Name"],
                ["provider", "Provider"],
                ["category", "Category"],
                ["version", "Version"],
                ["rateLimit", "Rate Limit"],
                ["authType", "Authentication Type"],
              ].map(([field, label]) => (
                <label key={field} className="block text-xs font-semibold text-slate-700">
                  {label}
                  <input
                    required
                    type="text"
                    value={registerForm[field]}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, [field]: event.target.value }))
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              ))}
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Base URL
              <input
                required
                type="url"
                value={registerForm.baseUrl}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, baseUrl: event.target.value }))
                }
                placeholder="https://api.example.com/v1"
                className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Description
              <textarea
                required
                rows={3}
                value={registerForm.description}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, description: event.target.value }))
                }
                className="mt-1 w-full resize-y rounded-lg border border-slate-300 p-3 text-xs font-normal outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                disabled={registeringApi}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registeringApi}
                className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registeringApi ? "Saving..." : "Save to Inventory"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL 1: APPROVE CONFIRMATION (PDF Page 32 & 38)
         ========================================================= */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Approve API Request</h3>
                <p className="text-xs text-slate-500">Post-approval automated subscription process</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to approve request <strong>{request.requestId}</strong>?
              This will automatically provision a <strong>Client ID</strong> and credentials for Maker <strong>{request.maker}</strong>, update their portal, and trigger confirmation email via SMTP.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <p><strong>API:</strong> {request.apiName}</p>
              <p><strong>Environment:</strong> {request.environment || "UAT"}</p>
              <p><strong>Consumer:</strong> {request.consumer}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? "Approving..." : "Confirm & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: REQUEST CLARIFICATION (PDF Page 34 & 39)
         ========================================================= */}
      {showClarifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-orange-700">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Clarification</h3>
                <p className="text-xs text-slate-500">Ask Maker to supply missing or unclear details</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Per enterprise workflow guidelines, if details such as TPS requirements, webhook specs, or business rationale are insufficient, query the Maker before taking a final decision.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clarification Query for Maker <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={clarificationQuestion}
                onChange={(e) => setClarificationQuestion(e.target.value)}
                placeholder="e.g. Please clarify expected transaction volume per second, failover requirements, and whether OAuth2 or mTLS authentication is preferred."
                rows={4}
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClarifyModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleClarify}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? "Sending..." : "Submit Inquiry to Maker"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: REJECT REQUEST (PDF Page 33 & 40)
         ========================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject API Request</h3>
                <p className="text-xs text-slate-500">Provide mandatory rejection justification</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              The Checker must provide a clear reason for rejection (e.g. &quot;Required business justification is missing&quot; or &quot;Duplicate API subscription&quot;). This reason is sent to the Maker.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                rows={3}
                className="w-full rounded-lg border border-rose-200 p-3 text-xs text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Paperclip size={16} />
                <span>{showAttachmentModal.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAttachmentModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <FileCheck size={36} className="mx-auto text-purple-600" />
              <p className="font-semibold text-slate-800">{showAttachmentModal.name}</p>
              <p className="text-[11px] text-slate-400">File size: {showAttachmentModal.size}</p>
              <p className="text-xs text-slate-600 pt-2">
                Document verified with Nishkaiv Solution security requirements.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAttachmentModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadAttachment(showAttachmentModal);
                  setShowAttachmentModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
