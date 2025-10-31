export async function loadRemoteConfig({
  setEditableConfig,
  setLastFetchedAt,
  setLastModifiedAt,
}) {
  const res = await fetch("/api/notion");
  const { config, lastModified } = await res.json();

  const now = new Date().toISOString();
  setEditableConfig(config);
  setLastFetchedAt(new Date(now).toLocaleString());
  setLastModifiedAt(
    lastModified ? new Date(lastModified).toLocaleString() : null,
  );

  localStorage.setItem("notionConfig", JSON.stringify(config));
  localStorage.setItem("notionConfigFetchedAt", now);
}
