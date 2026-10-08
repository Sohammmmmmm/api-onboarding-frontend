/**
 * Translates backend DTOs into the field names the React screens already read.
 * Put this file at src/services/mappers.js
 *
 * Backend (Java records)               ->  Screens
 *   api                                ->  apiName
 *   createdAt                          ->  submittedOn (also kept as createdAt)
 *   clarifications[].direction/author  ->  clarificationThread[].senderRole/sender/timestamp
 *   attachments[].fileName/sizeBytes   ->  attachments[].name/size (+ attachmentId)
 *   CheckerRequestDetailResponse       ->  flattened into one object
 */

const formatBytes = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const normalizeAttachment = (file = {}) => ({
  ...file,
  attachmentId: file.id,
  name: file.fileName ?? file.name,
  size: file.sizeBytes != null ? formatBytes(file.sizeBytes) : file.size,
});

export const normalizeClarification = (entry = {}) => ({
  ...entry,
  senderRole: entry.direction === "CHECKER_REQUEST" ? "CHECKER" : "MAKER",
  sender: entry.author,
  timestamp: entry.createdAt,
  attachments: (entry.attachments ?? []).map(normalizeAttachment),
});

/** List rows (RequestSummaryResponse) and maker detail (OnboardingRequestDetailResponse). */
export const normalizeRequest = (request) => {
  if (!request || typeof request !== "object") return request;

  const clarifications = request.clarifications ?? [];
  const credentials = request.credentials || request.credential || request.subscription?.credentials || request.subscription || {};

  return {
    ...request,
    apiName: request.apiName ?? request.api,
    source: request.source ?? request.submissionSource ?? request.requestSource ?? request.channel ??
      (request.originalEmail ? "EMAIL" : undefined),
    clientId: request.clientId ?? request.client_id ?? request.clientID ?? credentials.clientId ?? credentials.client_id ?? credentials.clientID,
    clientSecret: request.clientSecret ?? request.client_secret ?? request.clientSecretKey ?? credentials.clientSecret ?? credentials.client_secret,
    subscriptionId: request.subscriptionId ?? request.subscription_id ?? request.subscription?.subscriptionId ?? request.subscription?.subscription_id,
    submittedOn: request.submittedOn ?? request.createdAt,
    attachments: (request.attachments ?? []).map(normalizeAttachment),
    clarificationThread: clarifications.map(normalizeClarification),
    // Latest question the Checker asked, for the "clarification required" banner.
    clarificationQuestion:
      request.clarificationQuestion ??
      [...clarifications].reverse().find((c) => c.direction === "CHECKER_REQUEST")?.message,
  };
};

/** CheckerRequestDetailResponse -> one flat object for CheckerReviewScreen. */
export const normalizeCheckerDetail = (detail) => {
  if (!detail || typeof detail !== "object") return detail;
  // Already flat (e.g. mock data).
  if (!detail.request) {
    const request = normalizeRequest(detail);
    return {
      ...request,
      clientId: request.clientId ?? detail.client_id ?? detail.clientID ?? detail.subscription?.clientId ?? detail.subscription?.client_id ?? detail.credentials?.clientId ?? detail.credentials?.client_id,
      clientSecret: request.clientSecret ?? detail.client_secret ?? detail.subscription?.clientSecret ?? detail.subscription?.client_secret ?? detail.credentials?.clientSecret ?? detail.credentials?.client_secret,
    };
  }

  const base = normalizeRequest(detail.request);
  const email = detail.originalEmail;
  const ai = detail.aiExtraction;

  return {
    ...base,
    clientId: base.clientId ?? detail.clientId ?? detail.client_id ?? detail.clientID ?? detail.subscription?.clientId ?? detail.subscription?.client_id ?? detail.credentials?.clientId ?? detail.credentials?.client_id,
    clientSecret: base.clientSecret ?? detail.clientSecret ?? detail.client_secret ?? detail.subscription?.clientSecret ?? detail.subscription?.client_secret ?? detail.credentials?.clientSecret ?? detail.credentials?.client_secret,
    aiReviewRequired: detail.aiReviewRequired,
    statusHistory: detail.statusHistory ?? [],
    audit: detail.audit ?? [],
    catalogueMatchResult: detail.catalogueMatch ?? null,

    originalEmail: email
      ? {
          from: email.sender,
          to: email.recipient,
          subject: email.subject,
          body: email.body,
          receivedOn: email.receivedAt ? new Date(email.receivedAt).toLocaleString() : undefined,
        }
      : undefined,

    aiExtractedInfo: ai
      ? {
          apiName: ai.api,
          apiProvider: ai.provider,
          consumerApplication: ai.consumer,
          environment: ai.environment,
          businessJustification: ai.reason,
          confidence:
            typeof ai.confidence === "number" ? `${(ai.confidence * 100).toFixed(1)}%` : undefined,
        }
      : undefined,
  };
};