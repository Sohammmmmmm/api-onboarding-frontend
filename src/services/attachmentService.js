import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

export const uploadAttachment = async (requestId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(
      `/onboarding/requests/${encodeURIComponent(requestId)}/attachments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    const request = MockStore.getRequestById(requestId);
    const attachment = { name: file.name, size: file.size, type: file.type };
    MockStore.updateRequest(requestId, {
      attachments: [...(request?.attachments || []), attachment],
    });
    return attachment;
  }
};

export const getAttachment = async (requestId, attachmentId) => {
  const response = await api.get(
    `/onboarding/requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachmentId)}`,
    { responseType: "blob" }
  );
  return response.data;
};