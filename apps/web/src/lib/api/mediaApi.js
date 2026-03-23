import { API_BASE_URL } from "./client";

export async function uploadQuestionImage(file, token) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/media/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
}

export async function uploadMaterialFile(file, token, langCode) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("lang_code", langCode);

  const response = await fetch(`${API_BASE_URL}/media/upload-material`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
}
