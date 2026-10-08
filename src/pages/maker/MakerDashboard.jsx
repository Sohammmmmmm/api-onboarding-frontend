import { useEffect, useMemo, useState } from "react";

import { useNavigate, Link, useSearchParams } from "react-router-dom";

import {

  getRequests,

  getRequestDetails,

} from "../../services/makerService";

import { getSubscriptions } from "../../services/subscriptionService";

import BrandMark from "../../components/common/BrandMark";

import RequestSourceBadge from "../../components/common/RequestSourceBadge";

import { normalizeRequest } from "../../services/mappers";



const PENDING_REQUEST_STATUSES = ["PENDING", "RECEIVED", "PROCESSING", "PENDING_REVIEW", "UNDER_REVIEW", "AI_ANALYZED"];

const normalizeRequestStatus = (status) => String(status || "").trim().toUpperCase().replace(/\s+/g, "_");

const getMakerRequestStatus = (status) => normalizeRequestStatus(status) === "APPROVED" ? "SUBSCRIBED" : status;



/* =========================================================

   ICONS

   ========================================================= */



function OverviewIcon({ type }) {

  const common = {

    width: 18,

    height: 18,

    viewBox: "0 0 24 24",

    fill: "none",

    stroke: "currentColor",

    strokeWidth: 2,

    strokeLinecap: "round",

    strokeLinejoin: "round",

  };



  if (type === "total") {

    return (

      <svg {...common}>

        <rect x="5" y="3" width="14" height="18" rx="2" />

        <path d="M8 7h8" />

        <path d="M8 11h8" />

        <path d="M8 15h5" />

      </svg>

    );

  }



  if (type === "pending") {

    return (

      <svg {...common}>

        <circle cx="12" cy="12" r="8.5" />

        <path d="M12 7v5l3 2" />

      </svg>

    );

  }



  if (type === "review") {

    return (

      <svg {...common}>

        <circle cx="9" cy="8" r="3" />

        <circle cx="16" cy="9" r="2.5" />

        <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />

        <path d="M14 14.5c2.8.1 4.6 1.5 5.2 4.5" />

      </svg>

    );

  }



  if (type === "approved") {

    return (

      <svg {...common}>

        <path d="M20 6 9 17l-5-5" />

      </svg>

    );

  }



  if (type === "subscribed") {

    return (

      <svg {...common}>

        <path d="M10 13a5 5 0 0 0 7.1.1l1.4-1.4a5 5 0 0 0-7.1-7.1L10 6" />

        <path d="M14 11a5 5 0 0 0-7.1-.1L5.5 12.3a5 5 0 0 0 7.1 7.1L14 18" />

      </svg>

    );

  }



  if (type === "rejected") {

    return (

      <svg {...common}>

        <path d="m8 8 8 8" />

        <path d="m16 8-8 8" />

        <circle cx="12" cy="12" r="9" />

      </svg>

    );

  }



  return null;

}



function SearchIcon() {

  return (

    <svg

      width="14"

      height="14"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="2"

      strokeLinecap="round"

      strokeLinejoin="round"

    >

      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />

    </svg>

  );

}



function CalendarIcon() {

  return (

    <svg

      width="15"

      height="15"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="2"

      strokeLinecap="round"

      strokeLinejoin="round"

    >

      <rect x="3" y="4" width="18" height="17" rx="2" />

      <path d="M16 2v4" />

      <path d="M8 2v4" />

      <path d="M3 10h18" />

    </svg>

  );

}



function CloseIcon() {

  return (

    <svg

      width="18"

      height="18"

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="2"

      strokeLinecap="round"

      strokeLinejoin="round"

    >

      <path d="m6 6 12 12" />

      <path d="m18 6-12 12" />

    </svg>

  );

}



/* =========================================================

   STATUS BADGE

   ========================================================= */



function StatusBadge({ status }) {

  const normalized = String(status || "")

    .replace(/_/g, " ")

    .toLowerCase();



  let className =

    "bg-gray-100 text-gray-600 border border-gray-200";



  let label = status || "Unknown";



  if (

    normalized === "pending" ||

    normalized === "received" ||

    normalized === "processing"

  ) {

    className =

      "bg-yellow-100 text-yellow-700 border border-yellow-200";

    label = "Pending";

  } else if (

    normalized === "under review" ||

    normalized === "pending review" ||

    normalized === "ai analyzed"

  ) {

    className =

      "bg-purple-100 text-purple-700 border border-purple-200";

    label = "Under Review";

  } else if (normalized === "approved") {

    className =

      "bg-green-100 text-green-700 border border-green-200";

    label = "Approved";

  } else if (normalized === "subscribed") {

    className =

      "bg-cyan-100 text-cyan-700 border border-cyan-200";

    label = "Subscribed";

  } else if (normalized === "rejected") {

    className =

      "bg-red-100 text-red-700 border border-red-200";

    label = "Rejected";

  } else if (normalized === "clarification required") {

    className =

      "bg-orange-100 text-orange-700 border border-orange-200";

    label = "Clarification Required";

  }



  return (

    <span

      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${className}`}

    >

      {label}

    </span>

  );

}



/* =========================================================

   SUMMARY CARD

   ========================================================= */



function SummaryCard({

  title,

  value,

  type,

  iconBackground,

  iconColor,

  onClick,

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className={`w-full rounded-md border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${iconBackground}`}

    >

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">



        <div

          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconColor}`}

        >

          <OverviewIcon type={type} />

        </div>



        <div>

          <p className="text-[10px] font-medium text-gray-500">

            {title}

          </p>



          <p className="mt-0.5 text-xl font-bold text-gray-800">

            {value ?? 0}

          </p>

        </div>



      </div>

    </button>

  );

}



/* =========================================================

   ERROR MESSAGE

   ========================================================= */



/* =========================================================

   DETAIL ROW

   ========================================================= */



function DetailRow({ label, value }) {

  return (

    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">



      <div className="text-xs font-semibold text-gray-500">

        {label}

      </div>



      <div className="break-words text-sm text-gray-800">

        {value || "—"}

      </div>



    </div>

  );

}



/* =========================================================

   REQUEST DETAILS MODAL

   ========================================================= */



function RequestDetailsModal({

  request,

  loading,

  error,

  onClose,

}) {

  return (

    <div

      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"

      onMouseDown={(event) => {

        if (event.target === event.currentTarget) {

          onClose();

        }

      }}

    >



      <div

        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"

        onMouseDown={(event) => event.stopPropagation()}

      >



        {/* Modal Header */}



        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-5 py-4">



          <div>

            <h2 className="text-lg font-bold text-[#17264d]">

              Request Details

            </h2>



            <p className="mt-0.5 text-xs text-gray-500">

              API onboarding request information

            </p>

          </div>



          <button

            type="button"

            onClick={onClose}

            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"

            aria-label="Close"

          >

            <CloseIcon />

          </button>



        </div>



        {/* Modal Content */}



        <div className="max-h-[calc(90vh-130px)] overflow-y-auto px-5 py-4">



          {loading && (

            <div className="flex min-h-[250px] items-center justify-center">



              <div className="flex flex-col items-center gap-3">



                <BrandMark className="h-10 w-7" animated />



                <p className="text-sm text-gray-500">

                  Loading request details...

                </p>



              </div>



            </div>

          )}



          {!loading && error && (

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">



              <p className="text-sm font-semibold text-red-800">

                Unable to load request details

              </p>



              <p className="mt-1 text-xs text-red-700">

                {error}

              </p>



            </div>

          )}



          {!loading && !error && request && (

            <div>



              <DetailRow

                label="Request ID"

                value={

                  request.requestId ??

                  request.requestID ??

                  request.id

                }

              />



              <DetailRow

                label="API Name"

                value={

                  request.apiName ??

                  request.api ??

                  request.name

                }

              />



              <DetailRow

                label="Provider"

                value={request.provider}

              />



              <DetailRow

                label="Consumer"

                value={request.consumer}

              />



              <DetailRow

                label="API Requirement"

                value={

                  request.apiRequirement ??

                  request.requirement

                }

              />



              <DetailRow

                label="Business Justification"

                value={request.businessJustification}

              />



              <DetailRow

                label="Environment"

                value={request.environment}

              />



              <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">



                <div className="text-xs font-semibold text-gray-500">

                  Status

                </div>



                <div>

                  <StatusBadge status={getMakerRequestStatus(request.status)} />

                </div>



              </div>



              <DetailRow

                label="Source"

                value={request.source}

              />



              <DetailRow

                label="Created At"

                value={

                  request.createdAt

                    ? new Date(

                        request.createdAt

                      ).toLocaleString("en-IN")

                    : "—"

                }

              />



              <DetailRow

                label="Updated At"

                value={

                  request.updatedAt

                    ? new Date(

                        request.updatedAt

                      ).toLocaleString("en-IN")

                    : "—"

                }

              />



              {request.checkerRemarks && (

                <DetailRow

                  label="Remarks"

                  value={request.checkerRemarks}

                />

              )}



              {(request.status === "REJECTED" || request.rejectionReason) && (

                <DetailRow

                  label="Rejection Reason"

                  value={request.rejectionReason || request.reason || request.checkerRemarks}

                />

              )}



              {request.clarificationQuestion && (

                <DetailRow

                  label="Clarification"

                  value={request.clarificationQuestion}

                />

              )}



              {request.status === "CLARIFICATION_REQUIRED" && (

                <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">

                  <p className="font-bold">Checker Query Pending:</p>

                  <p className="mt-1">{request.clarificationQuestion || "Please provide the requested details."}</p>

                  <Link

                    to={`/requests/${request.requestId || request.requestID || request.id}`}

                    className="mt-2 inline-flex items-center gap-1 font-bold text-orange-900 underline hover:text-orange-950"

                  >

                    Open Page to Answer Clarification &rarr;

                  </Link>

                </div>

              )}



            </div>

          )}



        </div>



        {/* Modal Footer */}



        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">



          {request ? (

            <Link

              to={`/requests/${request.requestId || request.requestID || request.id}`}

              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"

            >

              View Full Timeline & Details &rarr;

            </Link>

          ) : <div />}



          <button

            type="button"

            onClick={onClose}

            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"

          >

            Close

          </button>



        </div>



      </div>



    </div>

  );

}



/* =========================================================

   MAKER DASHBOARD

   ========================================================= */



export default function MakerDashboard() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedStatus = (searchParams.get("status") || "").toUpperCase();

  const selectedStatusLabel = selectedStatus === "TOTAL" ? "All" : selectedStatus.replaceAll("_", " ");



  const [dashboard, setDashboard] = useState({

    totalRequests: 0,

    pendingRequests: 0,

    subscribedRequests: 0,

    rejectedRequests: 0,

  });



  const [requests, setRequests] = useState([]);



  const [search, setSearch] = useState("");



  const [loading, setLoading] = useState(true);



  const [error, setError] = useState("");



  const [currentPage, setCurrentPage] = useState(1);



  const [selectedRequest, setSelectedRequest] = useState(null);



  const [requestDetails, setRequestDetails] = useState(null);



  const [requestDetailsLoading, setRequestDetailsLoading] =

    useState(false);



  const [requestDetailsError, setRequestDetailsError] =

    useState("");



  const rowsPerPage = 5;



  const handleStatusCardClick = (status = "") => {

    setSearch("");

    setCurrentPage(1);

    setSearchParams(status ? { status } : {});

  };



  /* =======================================================

     LOAD REQUESTS

     ======================================================= */



  const loadRequests = async () => {

    try {

      const response = await getRequests();



      const data =

        response?.data?.data ??

        response?.data ??

        [];



      const requestRows = (Array.isArray(data)

        ? data

        : Array.isArray(data?.content)

        ? data.content

        : Array.isArray(data?.requests)

        ? data.requests

        : []).map(normalizeRequest);

      const count = (statuses) => requestRows.filter((request) => statuses.includes(normalizeRequestStatus(request.status))).length;



      setRequests(requestRows);

      setDashboard({

        totalRequests: requestRows.length,

        pendingRequests: count(PENDING_REQUEST_STATUSES),

        subscribedRequests: count(["APPROVED", "SUBSCRIBED"]),

        rejectedRequests: count(["REJECTED"]),

      });



      return true;

    } catch (err) {

      console.error("Requests API error:", err);



      setRequests([]);

      setDashboard({ totalRequests: 0, pendingRequests: 0, subscribedRequests: 0, rejectedRequests: 0 });



      return false;

    }

  };



  /* =======================================================

     INITIAL LOAD

     ======================================================= */



  useEffect(() => {

    const loadData = async () => {

      setLoading(true);

      setError("");



      const [requestsSuccess, subscriptions] =

        await Promise.all([

          loadRequests(),

          getSubscriptions().catch((err) => {

            console.error("Subscriptions API error:", err);

            return null;

          }),

        ]);

      if (subscriptions) {

        setDashboard((current) => ({ ...current, subscribedRequests: subscriptions.length }));

      }



      if (!requestsSuccess) {

        setError(

          "Unable to load your requests."

        );

      }



      setLoading(false);

    };



    loadData();

  }, []);



  /* =======================================================

     RETRY

     ======================================================= */



  const handleRetry = async () => {

    setLoading(true);

    setError("");



    const [requestsSuccess, subscriptions] =

      await Promise.all([

        loadRequests(),

        getSubscriptions().catch((err) => {

          console.error("Subscriptions API error:", err);

          return null;

        }),

      ]);

    if (subscriptions) {

      setDashboard((current) => ({ ...current, subscribedRequests: subscriptions.length }));

    }



    if (!requestsSuccess) {

      setError(

        "Unable to load your requests."

      );

    }



    setLoading(false);

  };



  /* =======================================================

     OPEN REQUEST DETAILS

     ======================================================= */



  const handleRequestClick = async (requestId) => {

    setSelectedRequest(requestId);

    setRequestDetails(null);

    setRequestDetailsError("");

    setRequestDetailsLoading(true);



    try {

      const response = await getRequestDetails(requestId);



      const data =

        response?.data?.data ??

        response?.data ??

        {};



      setRequestDetails(data);

    } catch (err) {

      console.error(

        "Request details API error:",

        err

      );



      setRequestDetailsError(

        getErrorMessage(err)

      );

    } finally {

      setRequestDetailsLoading(false);

    }

  };



  /* =======================================================

     CLOSE MODAL

     ======================================================= */



  const handleCloseModal = () => {

    setSelectedRequest(null);

    setRequestDetails(null);

    setRequestDetailsError("");

    setRequestDetailsLoading(false);

  };



  /* =======================================================

     SEARCH

     ======================================================= */



  const filteredRequests = useMemo(() => {

    const searchValue = search

      .trim()

      .toLowerCase();



    return requests.filter((request) => {

      const normalizedStatus = normalizeRequestStatus(request.status);

      const statusGroups = {

        PENDING: PENDING_REQUEST_STATUSES,

        APPROVED: ["APPROVED", "SUBSCRIBED"],

        SUBSCRIBED: ["APPROVED", "SUBSCRIBED"],

        REJECTED: ["REJECTED"],

        CLARIFICATION_REQUIRED: ["CLARIFICATION_REQUIRED"],

      };

      const allowedStatuses = statusGroups[selectedStatus];

      if (allowedStatuses && !allowedStatuses.includes(normalizedStatus)) return false;

      if (!searchValue) return true;



      const requestId = String(

        request.requestId ??

          request.requestID ??

          request.id ??

          ""

      ).toLowerCase();



      const apiName = String(

        request.apiName ??

          request.api ??

          request.name ??

          ""

      ).toLowerCase();



      const provider = String(

        request.provider ?? ""

      ).toLowerCase();



      const status = String(

        request.status ?? ""

      ).toLowerCase();

      const reason = String(

        request.rejectionReason ?? request.reason ?? request.checkerRemarks ?? ""

      ).toLowerCase();



      return (

        requestId.includes(searchValue) ||

        apiName.includes(searchValue) ||

        provider.includes(searchValue) ||

        status.includes(searchValue) ||

        reason.includes(searchValue)

      );

    });

  }, [requests, search, selectedStatus]);



  /* =======================================================

     PAGINATION

     ======================================================= */



  const totalPages = Math.max(

    1,

    Math.ceil(

      filteredRequests.length / rowsPerPage

    )

  );



  const safePage = Math.min(

    currentPage,

    totalPages

  );



  const startIndex =

    (safePage - 1) * rowsPerPage;



  const paginatedRequests =

    filteredRequests.slice(

      startIndex,

      startIndex + rowsPerPage

    );



  const showingFrom =

    filteredRequests.length === 0

      ? 0

      : startIndex + 1;



  const showingTo = Math.min(

    startIndex + rowsPerPage,

    filteredRequests.length

  );



  const handleSearch = (value) => {

    setSearch(value);

    setCurrentPage(1);

  };



  /* =======================================================

     LAST UPDATED

     ======================================================= */



  const lastUpdated =

    new Date().toLocaleString("en-IN", {

      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",

    });



  /* =======================================================

     UI

     ======================================================= */



  return (

    <div className="min-h-full w-full bg-white p-4 sm:p-6">



      <div className="w-full max-w-none">



        {/* =================================================

            ERROR BANNER

            ================================================= */}



        {error && (

          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">



            <div className="flex items-start gap-3">



              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">

                !

              </div>



              <div>

                <p className="text-sm font-semibold text-red-800">

                  Unable to load dashboard information

                </p>



                <p className="mt-0.5 text-xs text-red-700">

                  {error}

                </p>

              </div>



            </div>



            <button

              type="button"

              onClick={handleRetry}

              disabled={loading}

              className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"

            >

              {loading

                ? "Retrying..."

                : "Retry"}

            </button>



          </div>

        )}



        {/* =================================================

            PAGE HEADER

            ================================================= */}



        <div className="mb-5 flex items-start gap-3">



          <div className="mt-1 h-8 w-1 rounded-full bg-blue-500" />



          <div>



            <h1 className="text-xl font-bold tracking-tight text-[#101936]">

              {selectedStatus ? `${selectedStatusLabel} Requests` : "API Onboarding Dashboard"}

            </h1>



            <p className="mt-0.5 text-xs text-gray-500">

              {selectedStatus

                ? `Showing all ${selectedStatusLabel.toLowerCase()} requests`

                : "Overview of API onboarding requests and their current status • Nishkaiv Solution"}

            </p>



          </div>



        </div>



        {/* Clarification Alert Banner */}

        {!selectedStatus && requests.some((r) => r.status === "CLARIFICATION_REQUIRED") && (

          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-xs text-orange-900 shadow-2xs">

            <div className="flex items-center gap-3">

              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold text-sm shrink-0">

                ?

              </span>

              <div>

                <p className="font-bold text-slate-900">Action Needed: Checker Requested Clarification</p>

                <p className="text-[11px] text-orange-800 mt-0.5">

                  The Compliance Checker reviewed your request and asked for additional specifications. Please respond so review can finish.

                </p>

              </div>

            </div>

            <button

              type="button"

              onClick={() => handleStatusCardClick("CLARIFICATION_REQUIRED")}

              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto cursor-pointer"

            >

              Filter Queries

            </button>

          </div>

        )}



        {/* =================================================

            OVERVIEW

            ================================================= */}



        <div className={`${selectedStatus ? "hidden " : ""}overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_2px_12px_rgba(40,100,180,0.10)]`}>



          {/* Overview Header */}



          <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">



            <div className="flex items-center gap-2">



              <div className="text-blue-600">



                <svg

                  width="18"

                  height="18"

                  viewBox="0 0 24 24"

                  fill="currentColor"

                >

                  <rect

                    x="4"

                    y="10"

                    width="4"

                    height="10"

                    rx="1"

                  />



                  <rect

                    x="10"

                    y="6"

                    width="4"

                    height="14"

                    rx="1"

                  />



                  <rect

                    x="16"

                    y="3"

                    width="4"

                    height="17"

                    rx="1"

                  />

                </svg>



              </div>



              <span className="text-[11px] font-bold uppercase tracking-wide text-[#17264d]">

                API Onboarding Overview

              </span>



            </div>



            <div className="flex items-center gap-1.5 text-[9px] text-gray-500">



              <CalendarIcon />



              <div>

                <span className="font-semibold">

                  Last Updated

                </span>



                <span className="ml-1">

                  {lastUpdated}

                </span>

              </div>



            </div>



          </div>



          {/* Summary Cards */}



          <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-7">



            <SummaryCard

              title="My Requests"

              value={dashboard.totalRequests}

              type="total"

              iconBackground="border-blue-100 bg-blue-50"

              iconColor="bg-blue-100 text-blue-600"

              onClick={() => handleStatusCardClick("TOTAL")}

            />



            <SummaryCard

              title="Pending Checker"

              value={dashboard.pendingRequests}

              type="pending"

              iconBackground="border-yellow-100 bg-yellow-50"

              iconColor="bg-yellow-100 text-yellow-600"

              onClick={() => handleStatusCardClick("PENDING")}

            />



            <SummaryCard

              title="Clarifications"

              value={requests.filter((r) => r.status === "CLARIFICATION_REQUIRED").length}

              type="review"

              iconBackground="border-orange-100 bg-orange-50"

              iconColor="bg-orange-100 text-orange-600"

              onClick={() => handleStatusCardClick("CLARIFICATION_REQUIRED")}

            />



            <SummaryCard

              title="Approved"

              value={dashboard.subscribedRequests}

              type="approved"

              iconBackground="border-green-100 bg-green-50"

              iconColor="bg-green-100 text-green-600"

              onClick={() => handleStatusCardClick("APPROVED")}

            />



            <SummaryCard

              title="Rejected"

              value={dashboard.rejectedRequests}

              type="rejected"

              iconBackground="border-red-100 bg-red-50"

              iconColor="bg-red-100 text-red-600"

              onClick={() => handleStatusCardClick("REJECTED")}

            />



            <SummaryCard

              title="Applications"

              value={3}

              type="total"

              iconBackground="border-purple-100 bg-purple-50"

              iconColor="bg-purple-100 text-purple-600"

              onClick={() => navigate("/applications")}

            />



            <SummaryCard

              title="Active APIs"

              value={dashboard.subscribedRequests + 2}

              type="subscribed"

              iconBackground="border-cyan-100 bg-cyan-50"

              iconColor="bg-cyan-100 text-cyan-600"

              onClick={() => navigate("/subscriptions")}

            />



          </div>






          </div>






        {/* =================================================

            MY REQUESTS

            ================================================= */}



        <div className="mt-4 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_2px_12px_rgba(40,100,180,0.08)]">



          {/* Header */}

          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5 lg:flex-row lg:items-center lg:justify-between">



            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                  <rect x="5" y="3" width="14" height="18" rx="2" />

                  <path d="M8 7h8" />

                  <path d="M8 11h8" />

                  <path d="M8 15h5" />

                </svg>

              </div>



              <div className="min-w-0">

                <h2 className="text-sm font-bold text-[#17264d] sm:text-base">

                  {selectedStatus ? `${selectedStatusLabel} Requests` : "My Requests"}

                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">

                  List of API onboarding requests raised by you

                </p>

              </div>

            </div>



            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">



              <div className="relative w-full sm:w-48 lg:w-56">

                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">

                  <SearchIcon />

                </div>



                <input

                  type="text"

                  value={search}

                  onChange={(event) => handleSearch(event.target.value)}

                  placeholder="Search requests..."

                  className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"

                />

              </div>



              <a

                href="https://mail.google.com/mail/?view=cm&fs=1"

                target="_blank"

                rel="noreferrer"

                aria-label="Open Gmail to email the checker"

                title="Email the checker with Gmail"

                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:w-auto"

              >

                <img

                  src="https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png"

                  alt=""

                  className="h-5 w-5"

                />

                <span>Email Checker</span>

              </a>



              <Link

                to="/requests/new"

                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"

              >

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">

                  <path d="M12 5v14" />

                  <path d="M5 12h14" />

                </svg>

                <span>New Request</span>

              </Link>



            </div>

          </div>



          {/* Desktop Table */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[1040px] border-collapse">

              <thead>

                <tr className="bg-[#f1f5fa]">

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">Request ID</th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">Source</th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">API</th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">Provider</th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">Status</th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">Reason / Details</th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase text-slate-500">Created On</th>

                  <th className="px-4 py-2.5 text-center text-[9px] font-bold uppercase text-slate-500">Actions</th>

                </tr>

              </thead>



              <tbody>

                {paginatedRequests.length > 0 ? (

                  paginatedRequests.map((request, index) => {

                    const requestId = request.requestId ?? request.requestID ?? request.id ?? `REQ-${index + 1}`;

                    const apiName = request.apiName ?? request.api ?? request.name ?? "—";

                    const provider = request.provider ?? "—";

                    const status = getMakerRequestStatus(request.status ?? "Pending");

                    const reason = request.rejectionReason ?? request.reason ?? request.checkerRemarks ?? request.businessJustification ?? "—";

                    const createdOn = request.createdAt

                      ? new Date(request.createdAt).toLocaleDateString("en-US", {

                          month: "short",

                          day: "2-digit",

                          year: "numeric",

                        })

                      : "—";



                    return (

                      <tr key={requestId} className="border-b border-slate-100 transition hover:bg-blue-50/30">

                        <td className="px-4 py-2.5">

                          <button

                            type="button"

                            onClick={() => handleRequestClick(requestId)}

                            className="text-[10px] font-bold text-[#17264d] transition hover:text-blue-600"

                          >

                            {requestId}

                          </button>

                        </td>



                        <td className="px-4 py-2.5">

                          <RequestSourceBadge source={request.source} />

                        </td>



                        <td className="max-w-[220px] px-4 py-2.5 text-[10px] font-medium text-slate-700">

                          <span className="block truncate">{apiName}</span>

                        </td>



                        <td className="px-4 py-2.5 text-[10px] text-slate-600">{provider}</td>



                        <td className="px-4 py-2.5">

                          <StatusBadge status={status} />

                        </td>



                        <td className="max-w-[280px] px-4 py-2.5 text-[10px] text-slate-600">

                          <span className="block truncate" title={reason}>{reason}</span>

                        </td>



                        <td className="whitespace-nowrap px-4 py-2.5 text-[10px] text-slate-600">{createdOn}</td>



                        <td className="px-4 py-2.5">

                          <div className="flex items-center justify-center gap-2">

                            <button

                              type="button"

                              onClick={() => handleRequestClick(requestId)}

                              title="View request"

                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"

                            >

                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

                                <circle cx="12" cy="12" r="2.5" />

                              </svg>

                            </button>



                          </div>

                        </td>

                      </tr>

                    );

                  })

                ) : (

                  <tr>

                    <td colSpan="8" className="px-4 py-10 text-center">

                      <div className="flex flex-col items-center">

                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">

                            <rect x="5" y="3" width="14" height="18" rx="2" />

                            <path d="M8 8h8" />

                            <path d="M8 12h8" />

                            <path d="M8 16h5" />

                          </svg>

                        </div>

                        <p className="text-xs font-medium text-slate-500">

                          {search ? "No requests match your search." : "No requests available."}

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>



          {/* Mobile Cards */}

          <div className="divide-y divide-slate-100 md:hidden">

            {paginatedRequests.length > 0 ? (

              paginatedRequests.map((request, index) => {

                const requestId = request.requestId ?? request.requestID ?? request.id ?? `REQ-${index + 1}`;

                const apiName = request.apiName ?? request.api ?? request.name ?? "—";

                const provider = request.provider ?? "—";

                const status = getMakerRequestStatus(request.status ?? "Pending");

                const reason = request.rejectionReason ?? request.reason ?? request.checkerRemarks ?? request.businessJustification ?? "—";

                const createdOn = request.createdAt

                  ? new Date(request.createdAt).toLocaleDateString("en-US", {

                      month: "short",

                      day: "2-digit",

                      year: "numeric",

                    })

                  : "—";



                return (

                  <div key={requestId} className="p-4">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Request ID</p>

                        <button

                          type="button"

                          onClick={() => handleRequestClick(requestId)}

                          className="mt-1 break-all text-sm font-bold text-[#17264d] hover:text-blue-600"

                        >

                          {requestId}

                        </button>

                        <div className="mt-1">

                          <RequestSourceBadge source={request.source} />

                        </div>

                      </div>

                      <StatusBadge status={status} />

                    </div>



                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="min-w-0">

                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">API</p>

                        <p className="mt-1 truncate text-xs font-medium text-slate-700">{apiName}</p>

                      </div>



                      <div className="min-w-0">

                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Provider</p>

                        <p className="mt-1 truncate text-xs text-slate-600">{provider}</p>

                      </div>



                      <div>

                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Created On</p>

                        <p className="mt-1 text-xs text-slate-600">{createdOn}</p>

                      </div>



                      <div className="col-span-2">

                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Reason / Details</p>

                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{reason}</p>

                      </div>

                    </div>



                    <div className="mt-4 flex gap-2">

                      <button

                        type="button"

                        onClick={() => handleRequestClick(requestId)}

                        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"

                      >

                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

                          <circle cx="12" cy="12" r="2.5" />

                        </svg>

                        View Request

                      </button>



                    </div>

                  </div>

                );

              })

            ) : (

              <div className="px-4 py-10 text-center">

                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">

                    <rect x="5" y="3" width="14" height="18" rx="2" />

                    <path d="M8 8h8" />

                    <path d="M8 12h8" />

                    <path d="M8 16h5" />

                  </svg>

                </div>

                <p className="text-xs font-medium text-slate-500">

                  {search ? "No requests match your search." : "No requests available."}

                </p>

              </div>

            )}

          </div>



          {/* Pagination */}

          <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[9px] text-slate-500">

              Showing {showingFrom} - {showingTo} of {filteredRequests.length} requests

            </p>



            <div className="flex items-center gap-1">

              <button

                type="button"

                disabled={safePage <= 1}

                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}

                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

              >

                ‹

              </button>



              {Array.from({ length: totalPages }, (_, index) => index + 1)

                .slice(0, 5)

                .map((page) => (

                  <button

                    key={page}

                    type="button"

                    onClick={() => setCurrentPage(page)}

                    className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[10px] font-semibold transition ${

                      safePage === page

                        ? "bg-blue-600 text-white"

                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"

                    }`}

                  >

                    {page}

                  </button>

                ))}



              <button

                type="button"

                disabled={safePage >= totalPages}

                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}

                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-xs text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"

              >

                ›

              </button>

            </div>

          </div>



        </div>



      </div>

        {/* =====================================================

          REQUEST DETAILS MODAL

          ===================================================== */}



      {selectedRequest && (

        <RequestDetailsModal

          request={requestDetails}

          loading={requestDetailsLoading}

          error={requestDetailsError}

          onClose={handleCloseModal}

        />

      )}

    </div>

  );

}
