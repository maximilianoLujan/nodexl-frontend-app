const rawApiUrl = import.meta.env.PUBLIC_API_URL;

const defaultApiUrl = "http://127.0.0.1:8000";

const apiUrl = (
  rawApiUrl && rawApiUrl.trim().length > 0 ? rawApiUrl : defaultApiUrl
)
  .trim()
  .replace(/\/+$/, "");

export default apiUrl;
