const STORAGE_KEYS = {
  REQUESTS: "api_onboarding_requests_v2",
  CATALOGUE: "api_onboarding_catalogue_v2",
  NOTIFICATIONS: "api_onboarding_notifications_v2",
  SUBSCRIPTIONS: "api_onboarding_subscriptions_v2",
};

const INITIAL_CATALOGUE = [
  {
    id: "API-CAT-001",
    apiName: "Customer Account API",
    category: "Core Banking",
    provider: "Core Banking",
    version: "v2.1",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/cbs/v2/accounts",
    authType: "OAuth2 (Client Credentials)",
    rateLimit: "1,500 req/min",
    description: "Fetches customer bank accounts, balances, nominee details, and IFSC routing information.",
    endpoints: [
      { method: "GET", path: "/accounts/{accountNumber}", summary: "Get account details and current balance" },
      { method: "GET", path: "/accounts/{accountNumber}/nominees", summary: "Get nominee details" },
      { method: "GET", path: "/customers/{customerId}/accounts", summary: "List all accounts for customer" },
    ],
    updatedAt: "2026-09-20T10:00:00",
  },
  {
    id: "API-CAT-002",
    apiName: "Transaction History API",
    category: "Core Banking",
    provider: "Core Banking",
    version: "v1.8",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/cbs/v1/transactions",
    authType: "OAuth2 (Client Credentials)",
    rateLimit: "2,000 req/min",
    description: "Real-time query of account debit/credit ledger, mini-statements, and transaction search.",
    endpoints: [
      { method: "GET", path: "/statements/mini/{accountNumber}", summary: "Fetch latest 10 transactions" },
      { method: "POST", path: "/statements/search", summary: "Filter transactions by date and range" },
    ],
    updatedAt: "2026-09-18T14:30:00",
  },
  {
    id: "API-CAT-003",
    apiName: "Fund Transfer API",
    category: "Payments",
    provider: "Payment System",
    version: "v3.0",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/payments/v3/transfers",
    authType: "Mutual TLS + OAuth2",
    rateLimit: "3,000 req/min",
    description: "Inter-bank and intra-bank money transfers via NEFT, RTGS, and IMPS protocols.",
    endpoints: [
      { method: "POST", path: "/transfers/internal", summary: "Intra-bank account transfer" },
      { method: "POST", path: "/transfers/neft-rtgs", summary: "External clearing transfer" },
      { method: "GET", path: "/transfers/{utr}/status", summary: "Track transfer UTR status" },
    ],
    updatedAt: "2026-09-22T09:15:00",
  },
  {
    id: "API-CAT-004",
    apiName: "Payment Gateway API",
    category: "Payments",
    provider: "Payment System",
    version: "v2.4",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/pg/v2",
    authType: "API Key + Secret Hash",
    rateLimit: "1,200 req/min",
    description: "Merchant checkout processing, webhooks, and QR UPI payment generation.",
    endpoints: [
      { method: "POST", path: "/orders", summary: "Initiate merchant payment order" },
      { method: "POST", path: "/orders/{orderId}/refund", summary: "Process refund" },
    ],
    updatedAt: "2026-09-15T11:45:00",
  },
  {
    id: "API-CAT-005",
    apiName: "Account Statement API",
    category: "Account Services",
    provider: "Account System",
    version: "v1.2",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/statements/v1",
    authType: "OAuth2",
    rateLimit: "500 req/min",
    description: "Generates signed password-protected PDF and JSON account statements.",
    endpoints: [
      { method: "POST", path: "/generate/pdf", summary: "Generate PDF statement" },
      { method: "GET", path: "/download/{statementId}", summary: "Download statement document" },
    ],
    updatedAt: "2026-09-10T16:20:00",
  },
  {
    id: "API-CAT-006",
    apiName: "Loan Details API",
    category: "Lending",
    provider: "Lending",
    version: "v1.5",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/lending/v1/loans",
    authType: "OAuth2",
    rateLimit: "600 req/min",
    description: "Queries personal, home, and vehicle loan accounts, EMI schedules, and outstanding balances.",
    endpoints: [
      { method: "GET", path: "/loans/{loanId}", summary: "Get loan account breakdown" },
      { method: "GET", path: "/loans/{loanId}/schedule", summary: "Fetch repayment amortization schedule" },
    ],
    updatedAt: "2026-09-12T13:10:00",
  },
  {
    id: "API-CAT-007",
    apiName: "Card Details API",
    category: "Cards",
    provider: "Cards",
    version: "v2.0",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/cards/v2",
    authType: "Mutual TLS",
    rateLimit: "1,000 req/min",
    description: "Debit and Credit card controls: block/unblock, international usage toggle, limit management.",
    endpoints: [
      { method: "GET", path: "/cards/{cardToken}", summary: "Query card status and limits" },
      { method: "POST", path: "/cards/{cardToken}/controls", summary: "Update card spend controls" },
    ],
    updatedAt: "2026-09-19T08:50:00",
  },
  {
    id: "API-CAT-008",
    apiName: "Customer KYC & Verification API",
    category: "Customer Information",
    provider: "Customer Management",
    version: "v1.1",
    status: "ACTIVE",
    baseUrl: "https://api.nishkaiv.com/kyc/v1",
    authType: "OAuth2",
    rateLimit: "800 req/min",
    description: "Identity verification, PAN verification, and Aadhaar eKYC status checks.",
    endpoints: [
      { method: "POST", path: "/kyc/verify-pan", summary: "Validate PAN credentials" },
    ],
    updatedAt: "2026-09-21T17:00:00",
  },
];

const INITIAL_REQUESTS = [
  {
    id: "REQ-2025-001",
    requestId: "REQ-2025-001",
    maker: "Soham Matkar",
    makerEmail: "soham@nishkaiv.com",
    provider: "Core Banking",
    consumer: "Mobile Banking",
    requestedApi: "Customer Account API",
    apiName: "Customer Account API",
    environment: "UAT",
    status: "PENDING_REVIEW",
    reason: "Required to retrieve customer account information for the mobile banking application. This is needed for the upcoming feature release.",
    businessJustification: "Required to retrieve customer account information for the mobile banking application.",
    apiRequirement: "Provide REST endpoint for fetching account balance, mini statement, and nominee details with JWT validation.",
    additionalInformation: "This API will be used for account balance, transaction history and account details.",
    submittedOn: "2026-09-24T10:30:00",
    createdAt: "2026-09-24T10:30:00",
    updatedAt: "2026-09-24T10:30:00",
    source: "EMAIL",
    originalEmail: {
      from: "soham@nishkaiv.com",
      to: "api-requests@nishkaiv.com",
      subject: "Request for Customer Account API Access",
      receivedOn: "2026-09-24T10:28:00",
      body: "Dear Team,\n\nWe require access to the Customer Account API to retrieve customer account information for our mobile banking application. This is needed for the upcoming feature release.\n\nPlease provide the necessary access in UAT environment.\n\nRegards,\nSoham Matkar",
    },
    aiExtractedInfo: {
      apiName: "Customer Account API",
      apiProvider: "Core Banking",
      consumerApplication: "Mobile Banking",
      environment: "UAT",
      businessJustification: "Required to retrieve customer account information for the mobile banking application.",
      additionalInformation: "This API will be used for account balance, transaction history and account details.",
      confidence: "98.4%",
      intent: "API_ONBOARDING",
      matchStatus: "FOUND_IN_CATALOGUE",
    },
    attachments: [
      { name: "API_Requirement_Document.pdf", size: "245 KB", type: "application/pdf" },
      { name: "Use_Case_Details.xlsx", size: "120 KB", type: "application/vnd.ms-excel" },
    ],
    checkerRemarks: "",
    clarificationThread: [],
    statusHistory: [
      { newStatus: "RECEIVED", remarks: "Email received and parsed via IMAP", createdAt: "2026-09-24T10:28:00" },
      { newStatus: "AI_ANALYZED", remarks: "LLM extraction complete with 98.4% confidence", createdAt: "2026-09-24T10:29:15" },
      { newStatus: "PENDING_REVIEW", remarks: "Queued for Checker review", createdAt: "2026-09-24T10:30:00" },
    ],
  },
  {
    id: "API-001",
    requestId: "API-001",
    maker: "User A",
    makerEmail: "user.a@nishkaiv.com",
    provider: "Core Banking",
    consumer: "Mobile Banking",
    requestedApi: "Customer Account Details",
    apiName: "Customer Account Details",
    environment: "UAT",
    status: "SUBSCRIBED",
    reason: "Integration with mobile balance enquiry widget.",
    businessJustification: "Integration with mobile balance enquiry widget.",
    apiRequirement: "Account inquiry endpoints for authenticated retail users.",
    additionalInformation: "OAuth2 client credentials needed.",
    submittedOn: "2026-09-20T11:15:00",
    createdAt: "2026-09-20T11:15:00",
    updatedAt: "2026-09-21T15:00:00",
    source: "MAKER_PORTAL",
    clientId: "nks_prod_77189a42be",
    clientSecret: "sec_994b7e88301c2384a",
    subscriptionId: "SUB-2026-09-001",
    checkerRemarks: "Approved by Enterprise Checker. Key issued.",
    clarificationThread: [],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted by User A", createdAt: "2026-09-20T11:15:00" },
      { newStatus: "APPROVED", remarks: "Approved by Checker", createdAt: "2026-09-21T14:50:00" },
      { newStatus: "SUBSCRIBED", remarks: "Client ID and credentials provisioned", createdAt: "2026-09-21T15:00:00" },
    ],
  },
  {
    id: "API-002",
    requestId: "API-002",
    maker: "User B",
    makerEmail: "user.b@nishkaiv.com",
    provider: "Payment System",
    consumer: "CRM",
    requestedApi: "Payment API",
    apiName: "Payment API",
    environment: "DEV",
    status: "CLARIFICATION_REQUIRED",
    reason: "Initiate direct customer refunds from support CRM portal.",
    businessJustification: "Initiate direct customer refunds from support CRM portal.",
    apiRequirement: "Payment refund API endpoints.",
    additionalInformation: "Need sandbox credentials.",
    submittedOn: "2026-09-18T09:40:00",
    createdAt: "2026-09-18T09:40:00",
    updatedAt: "2026-09-19T11:20:00",
    source: "MAKER_PORTAL",
    checkerRemarks: "Awaiting details on peak volume and webhook endpoints.",
    clarificationQuestion: "Please specify your expected peak Transactions Per Second (TPS) and confirm if your CRM endpoint supports incoming asynchronous webhook callbacks with TLS 1.3.",
    clarificationThread: [
      {
        id: "msg-1",
        sender: "Checker (Compliance)",
        senderRole: "CHECKER",
        message: "Please specify your expected peak Transactions Per Second (TPS) and confirm if your CRM endpoint supports incoming asynchronous webhook callbacks with TLS 1.3.",
        timestamp: "2026-09-19T11:20:00",
      },
    ],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted via Maker Portal", createdAt: "2026-09-18T09:40:00" },
      { newStatus: "CLARIFICATION_REQUIRED", remarks: "Clarification requested by Checker", createdAt: "2026-09-19T11:20:00" },
    ],
  },
  {
    id: "API-003",
    requestId: "API-003",
    maker: "User C",
    makerEmail: "user.c@nishkaiv.com",
    provider: "Account System",
    consumer: "Web App",
    requestedApi: "Account API",
    apiName: "Account API",
    environment: "UAT",
    status: "PENDING_REVIEW",
    reason: "Corporate web portal account balance and download access.",
    businessJustification: "Corporate web portal account balance and download access.",
    apiRequirement: "Bulk statement download and real-time ledger query.",
    additionalInformation: "Corporate client servicing team requirement.",
    submittedOn: "2026-09-15T16:05:00",
    createdAt: "2026-09-15T16:05:00",
    updatedAt: "2026-09-15T16:05:00",
    source: "MAKER_PORTAL",
    checkerRemarks: "",
    clarificationThread: [],
    attachments: [
      { name: "Corporate_Integration_Specs.pdf", size: "310 KB", type: "application/pdf" },
    ],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted and awaiting Checker review", createdAt: "2026-09-15T16:05:00" },
    ],
  },
  {
    id: "API-2026-00121",
    requestId: "API-2026-00121",
    maker: "User A",
    makerEmail: "user.a@nishkaiv.com",
    provider: "Cards",
    consumer: "Cards Hub",
    requestedApi: "Card Details",
    apiName: "Card Details",
    environment: "PROD",
    status: "REJECTED",
    reason: "Direct CVV query access requested without PCI-DSS Level 1 tokenization gateway.",
    businessJustification: "Direct CVV query access requested.",
    apiRequirement: "Full PAN and CVV retrieval.",
    additionalInformation: "Requested for internal test audit.",
    submittedOn: "2026-09-10T12:00:00",
    createdAt: "2026-09-10T12:00:00",
    updatedAt: "2026-09-11T14:10:00",
    source: "MAKER_PORTAL",
    checkerRemarks: "Direct retrieval of unmasked CVV violates RBI security guidelines. Please route through the PCI Tokenization Vault instead.",
    rejectionReason: "Direct retrieval of unmasked CVV violates RBI security guidelines. Please route through the PCI Tokenization Vault instead.",
    clarificationThread: [],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted by Maker", createdAt: "2026-09-10T12:00:00" },
      { newStatus: "REJECTED", remarks: "Rejected: Violates security compliance", createdAt: "2026-09-11T14:10:00" },
    ],
  },
  {
    id: "API-2026-00122",
    requestId: "API-2026-00122",
    maker: "User B",
    makerEmail: "user.b@nishkaiv.com",
    provider: "Lending",
    consumer: "Loan Portal",
    requestedApi: "Loan Details",
    apiName: "Loan Details",
    environment: "UAT",
    status: "SUBSCRIBED",
    reason: "Retail loan inquiry module in internet banking portal.",
    businessJustification: "Retail loan inquiry module in internet banking portal.",
    apiRequirement: "Read-only access to active retail loan schedules.",
    additionalInformation: "UAT environment verification.",
    submittedOn: "2026-09-16T15:20:00",
    createdAt: "2026-09-16T15:20:00",
    updatedAt: "2026-09-17T11:00:00",
    source: "MAKER_PORTAL",
    clientId: "nks_uat_lending_991823",
    clientSecret: "sec_uat_4901fbc34",
    subscriptionId: "SUB-2026-09-002",
    checkerRemarks: "Approved for UAT environment.",
    clarificationThread: [],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted by Maker", createdAt: "2026-09-16T15:20:00" },
      { newStatus: "APPROVED", remarks: "Approved by Checker", createdAt: "2026-09-17T10:45:00" },
      { newStatus: "SUBSCRIBED", remarks: "Credentials generated", createdAt: "2026-09-17T11:00:00" },
    ],
  },
  {
    id: "API-2026-00123",
    requestId: "API-2026-00123",
    maker: "Soham Matkar",
    makerEmail: "soham@nishkaiv.com",
    provider: "Payments",
    consumer: "Merchant Desk",
    requestedApi: "Fund Transfer",
    apiName: "Fund Transfer",
    environment: "DEV",
    status: "PENDING_REVIEW",
    reason: "Automated supplier pay-outs for corporate client dashboard.",
    businessJustification: "Automated supplier pay-outs for corporate client dashboard.",
    apiRequirement: "IMPS and NEFT bulk transfer API.",
    additionalInformation: "DEV environment access for test pilot.",
    submittedOn: "2026-09-23T11:45:00",
    createdAt: "2026-09-23T11:45:00",
    updatedAt: "2026-09-23T11:45:00",
    source: "MAKER_PORTAL",
    checkerRemarks: "",
    clarificationThread: [],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted by Maker", createdAt: "2026-09-23T11:45:00" },
    ],
  },
  {
    id: "API-2026-00124",
    requestId: "API-2026-00124",
    maker: "User C",
    makerEmail: "user.c@nishkaiv.com",
    provider: "Core Banking",
    consumer: "Branch Ops",
    requestedApi: "Transaction History",
    apiName: "Transaction History",
    environment: "UAT",
    status: "UNDER_REVIEW",
    reason: "Internal branch operations customer audit trail verification.",
    businessJustification: "Internal branch operations customer audit trail verification.",
    apiRequirement: "Historical ledger access up to 7 years.",
    additionalInformation: "Branch operations requirement.",
    submittedOn: "2026-09-22T08:30:00",
    createdAt: "2026-09-22T08:30:00",
    updatedAt: "2026-09-22T09:00:00",
    source: "MAKER_PORTAL",
    checkerRemarks: "Under initial assessment by review officer.",
    clarificationThread: [],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted by Maker", createdAt: "2026-09-22T08:30:00" },
      { newStatus: "UNDER_REVIEW", remarks: "Checker began active assessment", createdAt: "2026-09-22T09:00:00" },
    ],
  },
  {
    id: "API-2026-00125",
    requestId: "API-2026-00125",
    maker: "Soham Matkar",
    makerEmail: "soham@nishkaiv.com",
    provider: "Core Banking",
    consumer: "Mobile Banking",
    requestedApi: "Customer Account Details",
    apiName: "Customer Account Details",
    environment: "PROD",
    status: "APPROVED",
    reason: "Production rollout of mobile banking balance feature.",
    businessJustification: "Production rollout of mobile banking balance feature.",
    apiRequirement: "Customer account details endpoint.",
    additionalInformation: "Production rollout.",
    submittedOn: "2026-09-21T10:00:00",
    createdAt: "2026-09-21T10:00:00",
    updatedAt: "2026-09-22T14:00:00",
    source: "EMAIL",
    clientId: "nks_prod_cbs_2026_88",
    clientSecret: "sec_prod_9912aa44bc",
    checkerRemarks: "All security checks satisfied. Approved.",
    clarificationThread: [],
    attachments: [],
    statusHistory: [
      { newStatus: "PENDING_REVIEW", remarks: "Submitted via Email", createdAt: "2026-09-21T10:00:00" },
      { newStatus: "APPROVED", remarks: "Approved by Checker", createdAt: "2026-09-22T14:00:00" },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-001",
    title: "Clarification Required for Request API-002",
    message: "Checker has requested additional information regarding peak TPS and webhook endpoints.",
    type: "CLARIFICATION_REQUIRED",
    requestId: "API-002",
    read: false,
    createdAt: "2026-09-19T11:20:00",
  },
  {
    id: "NOTIF-002",
    title: "New Request Assigned: REQ-2025-001",
    message: "A new API onboarding request for Customer Account API requires Checker review.",
    type: "NEW_REQUEST",
    requestId: "REQ-2025-001",
    read: false,
    createdAt: "2026-09-24T10:30:00",
  },
  {
    id: "NOTIF-003",
    title: "Request API-001 Subscribed",
    message: "Client ID and credentials have been provisioned successfully for Customer Account Details.",
    type: "SUBSCRIPTION_COMPLETED",
    requestId: "API-001",
    read: true,
    createdAt: "2026-09-21T15:00:00",
  },
  {
    id: "NOTIF-004",
    title: "Request API-2026-00121 Rejected",
    message: "Your request was rejected due to compliance guidelines regarding unmasked card numbers.",
    type: "REQUEST_REJECTED",
    requestId: "API-2026-00121",
    read: true,
    createdAt: "2026-09-11T14:10:00",
  },
];

// Helper to access localStorage safely
function getStoredItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Storage error:", e);
    return defaultValue;
  }
}

function setStoredItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

export const MockStore = {
  // REQUESTS
  getRequests: () => getStoredItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),

  getRequestById: (id) => {
    const requests = MockStore.getRequests();
    return (
      requests.find(
        (r) =>
          String(r.id).toLowerCase() === String(id).toLowerCase() ||
          String(r.requestId).toLowerCase() === String(id).toLowerCase()
      ) || null
    );
  },

  addRequest: (newReq) => {
    const requests = MockStore.getRequests();
    const id = newReq.requestId || `REQ-${Date.now().toString().slice(-6)}`;
    const fullRequest = {
      id,
      requestId: id,
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "MAKER_PORTAL",
      attachments: [],
      clarificationThread: [],
      statusHistory: [
        {
          newStatus: "PENDING_REVIEW",
          remarks: "Submitted via Maker Portal",
          createdAt: new Date().toISOString(),
        },
      ],
      ...newReq,
    };
    const updated = [fullRequest, ...requests];
    setStoredItem(STORAGE_KEYS.REQUESTS, updated);

    MockStore.addNotification({
      title: `New API Request Received: ${id}`,
      message: `Maker submitted a request for ${fullRequest.apiName || "API"}.`,
      type: "NEW_REQUEST",
      requestId: id,
    });

    return fullRequest;
  },

  updateRequest: (id, updates) => {
    const requests = MockStore.getRequests();
    let updatedTarget = null;
    const updated = requests.map((req) => {
      if (
        String(req.id).toLowerCase() === String(id).toLowerCase() ||
        String(req.requestId).toLowerCase() === String(id).toLowerCase()
      ) {
        const history = req.statusHistory ? [...req.statusHistory] : [];
        if (updates.status && updates.status !== req.status) {
          history.push({
            newStatus: updates.status,
            remarks: updates.remarks || updates.checkerRemarks || `Status changed to ${updates.status}`,
            createdAt: new Date().toISOString(),
          });
        }
        updatedTarget = {
          ...req,
          ...updates,
          updatedAt: new Date().toISOString(),
          statusHistory: history,
        };
        return updatedTarget;
      }
      return req;
    });
    setStoredItem(STORAGE_KEYS.REQUESTS, updated);
    return updatedTarget;
  },

  // Clarification Inquiry from Checker
  requestClarification: (id, question, checkerRemarks = "") => {
    const current = MockStore.getRequestById(id);
    if (!current) return null;

    const newThread = current.clarificationThread ? [...current.clarificationThread] : [];
    newThread.push({
      id: `msg-${Date.now()}`,
      sender: "Checker (Compliance)",
      senderRole: "CHECKER",
      message: question,
      timestamp: new Date().toISOString(),
    });

    const updated = MockStore.updateRequest(id, {
      status: "CLARIFICATION_REQUIRED",
      clarificationQuestion: question,
      checkerRemarks: checkerRemarks || current.checkerRemarks,
      clarificationThread: newThread,
      remarks: `Clarification requested: ${question}`,
    });

    MockStore.addNotification({
      title: `Clarification Required for ${id}`,
      message: `Checker has requested clarification: "${question.slice(0, 75)}..."`,
      type: "CLARIFICATION_REQUIRED",
      requestId: id,
    });

    return updated;
  },

  // Clarification Answer from Maker
  respondClarification: (id, answer) => {
    const current = MockStore.getRequestById(id);
    if (!current) return null;

    const newThread = current.clarificationThread ? [...current.clarificationThread] : [];
    newThread.push({
      id: `msg-${Date.now()}`,
      sender: current.maker || "Maker",
      senderRole: "MAKER",
      message: answer,
      timestamp: new Date().toISOString(),
    });

    const updated = MockStore.updateRequest(id, {
      status: "PENDING_REVIEW",
      makerClarificationAnswer: answer,
      clarificationThread: newThread,
      remarks: `Maker provided clarification: ${answer.slice(0, 60)}...`,
    });

    MockStore.addNotification({
      title: `Clarification Answered: ${id}`,
      message: `${current.maker || "Maker"} answered the clarification question. Ready for re-review.`,
      type: "CLARIFICATION_ANSWERED",
      requestId: id,
    });

    return updated;
  },

  // Checker Decision: Approve
  approveRequest: (id, remarks = "") => {
    const clientId = `nks_${Math.random().toString(36).substring(2, 10)}`;
    const clientSecret = `sec_${Math.random().toString(36).substring(2, 14)}`;
    const subscriptionId = `SUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = MockStore.updateRequest(id, {
      status: "SUBSCRIBED",
      clientId,
      clientSecret,
      subscriptionId,
      checkerRemarks: remarks || "Approved by Checker. Client ID and credentials generated.",
      remarks: remarks || "Request Approved and Subscribed.",
    });

    if (updated) {
      const subs = MockStore.getSubscriptions();
      const newSub = {
        id: subscriptionId,
        subscriptionId,
        requestId: id,
        apiName: updated.apiName || updated.requestedApi,
        provider: updated.provider,
        consumer: updated.consumer,
        environment: updated.environment,
        clientId,
        clientSecret,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        endpointUrl: `https://api.nishkaiv.com/gateway/${(updated.provider || "core").toLowerCase()}/v1`,
      };
      setStoredItem(STORAGE_KEYS.SUBSCRIPTIONS, [newSub, ...subs]);
    }

    MockStore.addNotification({
      title: `Request Approved: ${id}`,
      message: `Your API onboarding request for ${updated?.apiName || id} has been approved! Client ID: ${clientId}`,
      type: "REQUEST_APPROVED",
      requestId: id,
    });

    return updated;
  },

  // Checker Decision: Reject
  rejectRequest: (id, reason, remarks = "") => {
    const updated = MockStore.updateRequest(id, {
      status: "REJECTED",
      rejectionReason: reason,
      checkerRemarks: remarks || reason,
      remarks: `Request Rejected. Reason: ${reason}`,
    });

    MockStore.addNotification({
      title: `Request Rejected: ${id}`,
      message: `Your request was rejected. Reason: ${reason}`,
      type: "REQUEST_REJECTED",
      requestId: id,
    });

    return updated;
  },

  // API CATALOGUE
  getCatalogue: () => getStoredItem(STORAGE_KEYS.CATALOGUE, INITIAL_CATALOGUE),

  getApiById: (apiId) => {
    const list = MockStore.getCatalogue();
    return list.find((a) => a.id === apiId || a.apiName.toLowerCase() === apiId.toLowerCase()) || null;
  },

  createApiInCatalogue: (apiData) => {
    const catalogue = MockStore.getCatalogue();
    const id = `API-CAT-${String(catalogue.length + 1).padStart(3, "0")}`;
    const newApi = {
      id,
      version: "v1.0",
      status: "ACTIVE",
      authType: "OAuth2 (Client Credentials)",
      rateLimit: "1,000 req/min",
      updatedAt: new Date().toISOString(),
      endpoints: [
        { method: "GET", path: "/query", summary: "Query resource" },
        { method: "POST", path: "/execute", summary: "Execute transaction" },
      ],
      ...apiData,
    };
    const updated = [newApi, ...catalogue];
    setStoredItem(STORAGE_KEYS.CATALOGUE, updated);

    MockStore.addNotification({
      title: `New API Added to Catalogue: ${newApi.apiName}`,
      message: `${newApi.apiName} registered under provider ${newApi.provider}.`,
      type: "API_REGISTERED",
    });

    return newApi;
  },

  // SUBSCRIPTIONS
  getSubscriptions: () => {
    const subs = getStoredItem(STORAGE_KEYS.SUBSCRIPTIONS, []);
    if (!subs.length) {
      const initialSubs = [
        {
          id: "SUB-2026-09-001",
          subscriptionId: "SUB-2026-09-001",
          requestId: "API-001",
          apiName: "Customer Account Details",
          provider: "Core Banking",
          consumer: "Mobile Banking",
          environment: "UAT",
          clientId: "nks_prod_77189a42be",
          clientSecret: "sec_994b7e88301c2384a",
          status: "ACTIVE",
          createdAt: "2026-09-21T15:00:00",
          endpointUrl: "https://api.nishkaiv.com/cbs/v2/accounts",
        },
        {
          id: "SUB-2026-09-002",
          subscriptionId: "SUB-2026-09-002",
          requestId: "API-2026-00122",
          apiName: "Loan Details",
          provider: "Lending",
          consumer: "Loan Portal",
          environment: "UAT",
          clientId: "nks_uat_lending_991823",
          clientSecret: "sec_uat_4901fbc34",
          status: "ACTIVE",
          createdAt: "2026-09-17T11:00:00",
          endpointUrl: "https://api.nishkaiv.com/lending/v1/loans",
        },
      ];
      setStoredItem(STORAGE_KEYS.SUBSCRIPTIONS, initialSubs);
      return initialSubs;
    }
    return subs;
  },

  // NOTIFICATIONS
  getNotifications: () => getStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),

  addNotification: (notif) => {
    const notifs = MockStore.getNotifications();
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    };
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
    return newNotif;
  },

  markNotificationRead: (id) => {
    const notifs = MockStore.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  markAllNotificationsRead: () => {
    const updated = MockStore.getNotifications().map((notification) => ({ ...notification, read: true }));
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    return updated;
  },

  // MASTER DATA
  getEnvironments: () => [
    { id: "DEV", displayName: "Development", status: "ACTIVE", aliases: ["dev", "development"] },
    { id: "UAT", displayName: "UAT", status: "ACTIVE", aliases: ["uat", "testing"] },
    { id: "PROD", displayName: "Production", status: "ACTIVE", aliases: ["prod", "production"] },
    { id: "SANDBOX", displayName: "Sandbox", status: "ACTIVE", aliases: ["sandbox"] },
  ],

  getEnvironmentAliases: () => [
    { canonical: "DEV", alias: "dev" },
    { canonical: "DEV", alias: "development" },
    { canonical: "UAT", alias: "uat" },
    { canonical: "UAT", alias: "testing" },
    { canonical: "PROD", alias: "prod" },
    { canonical: "PROD", alias: "production" },
    { canonical: "SANDBOX", alias: "sandbox" },
  ],

  getCategories: () => ["Core Banking", "Payments", "Account Services", "Lending", "Cards", "Customer Information"],
  getAuthTypes: () => ["OAuth2 (Client Credentials)", "Mutual TLS + OAuth2", "API Key + Secret Hash", "Mutual TLS", "OAuth2"],
  getApplicationTypes: () => ["Mobile App", "Web Portal", "Backend Microservice", "Third-Party Integration"],

  // APPLICATIONS
  getApplications: () => {
    const initialApps = [
      { id: "APP-001", applicationId: "APP-001", name: "Mobile Banking", owner: "Soham Matkar", status: "ACTIVE", apiCount: 4 },
      { id: "APP-002", applicationId: "APP-002", name: "Internet Banking", owner: "Soham Matkar", status: "ACTIVE", apiCount: 3 },
      { id: "APP-003", applicationId: "APP-003", name: "Merchant Desk", owner: "Soham Matkar", status: "ACTIVE", apiCount: 2 },
    ];
    return getStoredItem("api_onboarding_applications_v1", initialApps);
  },

  getApplicationById: (id) => {
    const apps = MockStore.getApplications();
    return apps.find((a) => a.id === id || a.applicationId === id) || null;
  },

  createApplication: (appData) => {
    const apps = MockStore.getApplications();
    const id = `APP-${String(apps.length + 1).padStart(3, "0")}`;
    const newApp = {
      id,
      applicationId: id,
      owner: "Soham Matkar",
      status: "ACTIVE",
      apiCount: 0,
      createdAt: new Date().toISOString(),
      ...appData,
    };
    const updated = [newApp, ...apps];
    setStoredItem("api_onboarding_applications_v1", updated);
    return newApp;
  },

  getApplicationSubscriptions: (applicationId) => {
    const allSubs = getStoredItem("api_onboarding_app_subscriptions_v1", [
      { id: "ASUB-001", applicationId: "APP-001", apiId: "API-CAT-001", apiName: "Account Balance API", environment: "UAT", version: "v1", status: "ACTIVE" },
      { id: "ASUB-002", applicationId: "APP-001", apiId: "API-CAT-007", apiName: "Card Block API", environment: "UAT", version: "v1", status: "ACTIVE" },
      { id: "ASUB-003", applicationId: "APP-001", apiId: "API-CAT-003", apiName: "Bill Payment API", environment: "PROD", version: "v2", status: "ACTIVE" },
      { id: "ASUB-004", applicationId: "APP-002", apiId: "API-CAT-003", apiName: "Bill Payment API", environment: "PROD", version: "v2", status: "ACTIVE" },
    ]);
    return allSubs.filter((s) => s.applicationId === applicationId);
  },

  addSubscriptionToApplication: (applicationId, { apiId, environment, version }) => {
    const allSubs = getStoredItem("api_onboarding_app_subscriptions_v1", [
      { id: "ASUB-001", applicationId: "APP-001", apiId: "API-CAT-001", apiName: "Account Balance API", environment: "UAT", version: "v1", status: "ACTIVE" },
      { id: "ASUB-002", applicationId: "APP-001", apiId: "API-CAT-007", apiName: "Card Block API", environment: "UAT", version: "v1", status: "ACTIVE" },
      { id: "ASUB-003", applicationId: "APP-001", apiId: "API-CAT-003", apiName: "Bill Payment API", environment: "PROD", version: "v2", status: "ACTIVE" },
    ]);
    const apiObj = MockStore.getApiById(apiId);
    const newSub = {
      id: `ASUB-${Date.now().toString().slice(-6)}`,
      applicationId,
      apiId,
      apiName: apiObj?.apiName || apiId,
      environment: environment || "UAT",
      version: version || apiObj?.version || "v1",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    const updated = [newSub, ...allSubs];
    setStoredItem("api_onboarding_app_subscriptions_v1", updated);
    return newSub;
  },

  // PUBLISHER WORKFLOW
  getPublisherApis: (statusFilter = "") => {
    const initialPublisherApis = [
      {
        id: "PUB-API-001",
        apiId: "PUB-API-001",
        apiName: "Account Balance API",
        provider: "Core Banking",
        category: "Core Banking",
        version: "v1.0",
        environment: "UAT",
        authType: "OAuth2 (Client Credentials)",
        baseUrl: "https://api.nishkaiv.com/cbs/v1/accounts",
        description: "Retrieves customer account balances and mini statement info.",
        createdBy: "Rahul Sharma (Checker)",
        createdAt: "2026-10-08T10:35:00",
        checkerApprovalTime: "2026-10-08T10:36:00",
        status: "PENDING_PUBLICATION",
      },
      {
        id: "PUB-API-002",
        apiId: "PUB-API-002",
        apiName: "Card Block API",
        provider: "Cards",
        category: "Cards",
        version: "v1.0",
        environment: "UAT",
        authType: "Mutual TLS",
        baseUrl: "https://api.nishkaiv.com/cards/v1/block",
        description: "Allows instant blocking of stolen or misplaced cards.",
        createdBy: "Rahul Sharma (Checker)",
        createdAt: "2026-10-07T14:20:00",
        checkerApprovalTime: "2026-10-07T14:25:00",
        status: "PENDING_PUBLICATION",
      },
      {
        id: "PUB-API-003",
        apiId: "PUB-API-003",
        apiName: "Bill Payment API",
        provider: "Payment System",
        category: "Payments",
        version: "v2.0",
        environment: "PROD",
        authType: "OAuth2",
        baseUrl: "https://api.nishkaiv.com/payments/v2/bill",
        description: "Utility bill payments processing gateway.",
        createdBy: "Amit Kumar (Publisher)",
        createdAt: "2026-09-15T09:00:00",
        checkerApprovalTime: "2026-09-15T09:10:00",
        status: "PUBLISHED",
      },
      {
        id: "PUB-API-004",
        apiId: "PUB-API-004",
        apiName: "Legacy Statement API v1",
        provider: "Account System",
        category: "Account Services",
        version: "v1.0",
        environment: "PROD",
        authType: "OAuth2",
        baseUrl: "https://api.nishkaiv.com/statements/v1/legacy",
        description: "Legacy PDF statement generator service.",
        createdBy: "Amit Kumar (Publisher)",
        createdAt: "2026-05-10T11:00:00",
        checkerApprovalTime: "2026-05-10T11:15:00",
        status: "DEPRECATED",
      },
    ];
    const apis = getStoredItem("api_onboarding_publisher_apis_v1", initialPublisherApis);
    if (statusFilter) {
      return apis.filter((a) => a.status.toUpperCase() === statusFilter.toUpperCase());
    }
    return apis;
  },

  getPublisherApiById: (apiId) => {
    const apis = MockStore.getPublisherApis();
    return apis.find((a) => a.id === apiId || a.apiId === apiId) || null;
  },

  getPublisherApiTimeline: (apiId) => [
    { time: "10:35 AM", actor: "Soham Matkar (Maker)", role: "MAKER", action: "Created API Request REQ-10234" },
    { time: "10:36 AM", actor: "Rahul Sharma (Checker)", role: "CHECKER", action: "Approved Request & Created API (Status: PENDING PUBLICATION)" },
    { time: "11:10 AM", actor: "Amit Kumar (Publisher)", role: "PUBLISHER", action: "Reviewed & Published API" },
  ],

  publishApi: (apiId, remarks = "") => {
    const apis = MockStore.getPublisherApis();
    const updated = apis.map((a) => (a.id === apiId || a.apiId === apiId ? { ...a, status: "PUBLISHED", publishedAt: new Date().toISOString(), publisherRemarks: remarks } : a));
    setStoredItem("api_onboarding_publisher_apis_v1", updated);
    return updated.find((a) => a.id === apiId || a.apiId === apiId);
  },

  returnApi: (apiId, reason = "") => {
    const apis = MockStore.getPublisherApis();
    const updated = apis.map((a) => (a.id === apiId || a.apiId === apiId ? { ...a, status: "RETURNED_TO_CHECKER", returnReason: reason } : a));
    setStoredItem("api_onboarding_publisher_apis_v1", updated);
    return updated.find((a) => a.id === apiId || a.apiId === apiId);
  },

  deprecateApi: (apiId, reason = "") => {
    const apis = MockStore.getPublisherApis();
    const updated = apis.map((a) => (a.id === apiId || a.apiId === apiId ? { ...a, status: "DEPRECATED", deprecationReason: reason } : a));
    setStoredItem("api_onboarding_publisher_apis_v1", updated);
    return updated.find((a) => a.id === apiId || a.apiId === apiId);
  },

  retireApi: (apiId, reason = "") => {
    const apis = MockStore.getPublisherApis();
    const updated = apis.map((a) => (a.id === apiId || a.apiId === apiId ? { ...a, status: "RETIRED", retirementReason: reason } : a));
    setStoredItem("api_onboarding_publisher_apis_v1", updated);
    return updated.find((a) => a.id === apiId || a.apiId === apiId);
  },

  getPublisherDashboardStats: () => {
    const apis = MockStore.getPublisherApis();
    return {
      pendingPublication: apis.filter((a) => a.status === "PENDING_PUBLICATION").length,
      publishedApis: apis.filter((a) => a.status === "PUBLISHED").length,
      deprecatedApis: apis.filter((a) => a.status === "DEPRECATED").length,
      retiredApis: apis.filter((a) => a.status === "RETIRED").length,
      slaBreached: 2,
    };
  },

  // ADMIN DASHBOARD & USER MANAGEMENT
  getAdminDashboardStats: () => {
    const requests = MockStore.getRequests();
    const pubApis = MockStore.getPublisherApis();
    const apps = MockStore.getApplications();
    const subs = MockStore.getSubscriptions();
    return {
      totalRequests: requests.length,
      pendingChecker: requests.filter((r) => ["PENDING_REVIEW", "RECEIVED", "UNDER_REVIEW"].includes(r.status)).length,
      clarifications: requests.filter((r) => r.status === "CLARIFICATION_REQUIRED").length,
      approved: requests.filter((r) => ["APPROVED", "SUBSCRIBED"].includes(r.status)).length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
      pendingPublication: pubApis.filter((a) => a.status === "PENDING_PUBLICATION").length,
      publishedApis: pubApis.filter((a) => a.status === "PUBLISHED").length,
      applications: apps.length,
      activeSubscriptions: subs.length,
      slaBreaches: 2,
    };
  },

  getAdminUsers: () => {
    const initialUsers = [
      { id: "USR-001", name: "Soham Matkar", email: "soham@nishkaiv.com", username: "soham", role: "MAKER", status: "ACTIVE", lastLogin: "2026-10-08T10:30:00" },
      { id: "USR-002", name: "Rahul Sharma", email: "rahul@nishkaiv.com", username: "rahul", role: "CHECKER", status: "ACTIVE", lastLogin: "2026-10-08T11:15:00" },
      { id: "USR-003", name: "Amit Kumar", email: "amit@nishkaiv.com", username: "amit", role: "PUBLISHER", status: "ACTIVE", lastLogin: "2026-10-08T09:45:00" },
      { id: "USR-004", name: "Admin System", email: "admin@nishkaiv.com", username: "admin", role: "ADMIN", status: "ACTIVE", lastLogin: "2026-10-08T11:55:00" },
    ];
    return getStoredItem("api_onboarding_users_v1", initialUsers);
  },

  getAdminUserById: (userId) => {
    const users = MockStore.getAdminUsers();
    return users.find((u) => u.id === userId || u.username === userId || u.email === userId) || null;
  },

  updateUserRole: (userId, newRole) => {
    const users = MockStore.getAdminUsers();
    const updated = users.map((u) => (u.id === userId || u.username === userId ? { ...u, role: newRole } : u));
    setStoredItem("api_onboarding_users_v1", updated);
    return updated.find((u) => u.id === userId || u.username === userId);
  },

  getUserNotificationPreferences: (userId) => ({
    clarificationRequired: { email: true, sms: true, inApp: true },
    requestApproved: { email: true, sms: false, inApp: true },
    requestRejected: { email: true, sms: true, inApp: true },
    apiPublished: { email: true, sms: false, inApp: true },
    subscriptionCreated: { email: true, sms: false, inApp: true },
    slaBreach: { email: true, sms: true, inApp: true },
  }),

  updateUserNotificationPreferences: (userId, preferences) => preferences,

  getSlaConfiguration: () => getStoredItem("api_onboarding_sla_config_v1", {
    checkerReviewHours: 4,
    makerClarificationHours: 24,
    publisherReviewHours: 8,
    subscriptionProcessingHours: 4,
  }),

  updateSlaConfiguration: (config) => {
    setStoredItem("api_onboarding_sla_config_v1", config);
    return config;
  },

  getAuditLogs: () => [
    { timestamp: "2026-10-08T11:20:00", actor: "Soham Matkar", role: "MAKER", entity: "Subscription", action: "ASSIGN_API", oldStatus: "—", newStatus: "ACTIVE", details: "Assigned Account Balance API to Mobile Banking" },
    { timestamp: "2026-10-08T11:10:00", actor: "Amit Kumar", role: "PUBLISHER", entity: "API", action: "PUBLISH_API", oldStatus: "PENDING_PUBLICATION", newStatus: "PUBLISHED", details: "Published Account Balance API v1.0" },
    { timestamp: "2026-10-08T10:36:00", actor: "Rahul Sharma", role: "CHECKER", entity: "API", action: "CREATE_API", oldStatus: "APPROVED", newStatus: "PENDING_PUBLICATION", details: "Created API for REQ-10234" },
    { timestamp: "2026-10-08T10:31:00", actor: "Rahul Sharma", role: "CHECKER", entity: "Request", action: "APPROVE_REQUEST", oldStatus: "PENDING_REVIEW", newStatus: "APPROVED", details: "Approved request REQ-10234" },
    { timestamp: "2026-10-08T10:30:00", actor: "Soham Matkar", role: "MAKER", entity: "Request", action: "SUBMIT_CLARIFICATION", oldStatus: "CLARIFICATION_REQUIRED", newStatus: "PENDING_REVIEW", details: "Submitted clarification for REQ-10234" },
  ],

  getNotificationMatrix: () => [
    { event: "Clarification Required", email: true, sms: true, inApp: true },
    { event: "Request Approved", email: true, sms: false, inApp: true },
    { event: "Request Rejected", email: true, sms: true, inApp: true },
    { event: "API Published", email: true, sms: false, inApp: true },
    { event: "Subscription Created", email: true, sms: false, inApp: true },
    { event: "Subscription Failed", email: true, sms: true, inApp: true },
    { event: "SLA Warning", email: true, sms: true, inApp: true },
    { event: "SLA Breached", email: true, sms: true, inApp: true },
  ],

  updateNotificationMatrix: (matrix) => matrix,
};

