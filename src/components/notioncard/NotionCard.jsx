"use client";
import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";
import config from "@/config/rate-limit";
import { useCountdown } from "@/hooks/useCountdown";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./notioncard.module.css";
import Button from "@components/button/Button";
import RefreshGCalButton from "@components/button/RefreshGCalButton";
import RefreshNotionButton from "@components/button/RefreshNotionButton";
import TestConnectionButton from "@components/button/TestConnectionButton";
import validateConfigFormat from "@/utils/client/validate-config-format";

const LABEL_MAP = {
  goback_days: "Go Back Days",
  goforward_days: "Go Forward Days",
  database_id: "Notion Database ID",
  timecode: "Time Code",
  timezone: "Time Zone",
  default_event_length: "Default Event Length (min)",
  default_start_time: "Default Start Time (hour)",
  gcal_dic: "Google Calendar Mapping",
  page_property: "Page Property Mapping",
};

const NotionCard = ({ session }) => {
  const router = useRouter();
  const params = useSearchParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableConfig, setEditableConfig] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [lastModifiedAt, setLastModifiedAt] = useState(null);
  const [showFetchButton, setShowFetchButton] = useState(!isProd);
  // Keep draft of gcal_dic keys to avoid reordering on each keystroke
  const [draftGcalKeys, setDraftGcalKeys] = useState({});

  // Rate limit configuration
  const UPLOAD_LIMIT_MS = config.UPLOAD_MIN_MS ?? 3 * 60_000;
  const { startCountdown, isCountingDown, formattedRemaining } =
    useCountdown("cooldown:save");

  // Read query params for connection notices; auto-clear after 4s
  useEffect(() => {
    const google = params.get("google");
    const notion = params.get("notion");
    const reason = params.get("reason");

    let msg;

    if (google === "connected") msg = "✅ Google connected successfully";
    else if (google === "error") {
      if (reason === "email_mismatch")
        msg = "⚠️ Google account does not match your login account";
      else if (reason === "token")
        msg = "❌ Token exchange failed, please reauthorize";
      else if (reason === "state")
        msg = "⚠️ OAuth security verification failed";
      else msg = "❌ Google authorization failed, please try again later";
    }

    if (notion === "connected") msg = "✅ Notion connected successfully";
    else if (notion === "error") {
      if (reason === "token") msg = "❌ Notion token exchange failed";
      else if (reason === "state")
        msg = "⚠️ Notion security verification failed";
      else msg = "❌ Notion authorization failed, please try again later";
    }

    setNotice(msg);
    let t;
    if (msg) t = setTimeout(() => setNotice(null), 6000);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [params]);

  const loadRemoteConfig = async () => {
    try {
      const res = await fetch("/api/notion");
      if (!res.ok) throw new Error("Failed to fetch");

      const { config, lastModified } = await res.json();
      const now = new Date().toISOString();

      setEditableConfig(config);
      setLastFetchedAt(new Date(now).toLocaleString());
      setLastModifiedAt(
        lastModified ? new Date(lastModified).toLocaleString() : null,
      );

      localStorage.setItem("notionConfig", JSON.stringify(config));
      localStorage.setItem("notionConfigLastModified", lastModified ?? "");
      localStorage.setItem("notionConfigFetchedAt", now);
      return true;
    } catch (err) {
      logger.error("Failed to fetch config", err);
      alert("Failed to fetch config.");
      return false;
    }
  };

  // On component mount or when `notionConfig` changes:
  // 1. Try to load the config from localStorage.
  // 2. If found and valid, use it and show the last fetched time.
  // 3. If not, fall back to the passed-in `notionConfig` prop.
  // 4. If neither exists, fetch the config from the API as a last resort.
  //    - Also cache it in localStorage and store the fetch timestamp.
  useEffect(() => {
    const local = localStorage.getItem("notionConfig");
    const timestamp = localStorage.getItem("notionConfigFetchedAt");
    const modified = localStorage.getItem("notionConfigLastModified");

    if (local) {
      try {
        setEditableConfig(JSON.parse(local));

        const fetchTime = timestamp ? new Date(timestamp).getTime() : null;
        const modifyTime = modified ? new Date(modified).getTime() : null;

        if (!isProd || !fetchTime || !modifyTime || fetchTime < modifyTime) {
          setShowFetchButton(true);
        }

        if (fetchTime) setLastFetchedAt(new Date(fetchTime).toLocaleString());
        if (modifyTime)
          setLastModifiedAt(new Date(modifyTime).toLocaleString());

        return;
      } catch (err) {
        logger.warn("Failed to parse local config", err);
      }
    }

    // fallback to remote fetch
    loadRemoteConfig();
  }, []);

  if (!editableConfig) return <div>Loading configuration...</div>;
  if (!session?.user)
    return <div>Please log in to view your configuration.</div>;

  const handleCancelClick = () => {
    const local = localStorage.getItem("notionConfig");
    if (local) {
      try {
        setEditableConfig(JSON.parse(local));
      } catch {}
    }
    setEditMode(false);
  };

  const handleEditClick = () => setEditMode(true);

  const handleInputChange = (key, value) => {
    setEditableConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveClick = async () => {
    setLoading(true);
    const errors = validateConfigFormat(editableConfig);
    logger.debug("Editable config:", editableConfig);
    if (errors.length > 0) {
      alert("Validation failed:\n\n" + errors.join("\n"));
      setLoading(false);
      return;
    }

    const res = await fetch("/api/notion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editableConfig),
    });

    setLoading(false);

    if (res.ok) {
      alert("Saved successfully!");
      setEditMode(false);
      const now = new Date().toISOString();
      localStorage.setItem("notionConfig", JSON.stringify(editableConfig));
      localStorage.setItem("notionConfigFetchedAt", now);
      setLastFetchedAt(new Date(now).toLocaleString());
      startCountdown(UPLOAD_LIMIT_MS);
    } else {
      setShowFetchButton(true);
      const { message } = await res.json();
      alert("Save failed: " + message);
    }
  };

  const fetchFromS3 = async () => {
    setLoading(true);
    await loadRemoteConfig();
    setLoading(false);
  };

  const handleBackClick = () => router.push("/profile");

  return (
    <div className={styles.notioncard_container}>
      {Object.entries(editableConfig).map(([key, value]) => {
        const label = LABEL_MAP[key] || key;

        // Handle nested objects
        if (key === "gcal_dic" || key === "page_property") {
          const handleAdd = () => {
            setEditableConfig((prev) => ({
              ...prev,
              [key]: [...prev[key], { "": "" }],
            }));
          };

          const handleDelete = (index) => {
            setEditableConfig((prev) => {
              const updatedList = [...prev[key]];
              updatedList.splice(index, 1);
              return { ...prev, [key]: updatedList };
            });
          };

          return (
            <div key={key} className={styles.section_block}>
              <h4 className={styles.section_title}>{label}</h4>
              <div className={styles.nested_list}>
                {value.map((item, index) => (
                  <div key={index}>
                    {Object.entries(item).map(
                      ([subKey, subVal], entryIndex) => (
                        <div
                          key={`${key}-${index}-${entryIndex}`}
                          className={styles.nested_row}
                        >
                          {editMode && key === "gcal_dic" ? (
                            <>
                              <input
                                type="text"
                                id={`gcal_dic-${index}-${entryIndex}-k`}
                                name={`gcal_dic-${index}-${entryIndex}-k`}
                                value={
                                  draftGcalKeys[`${index}-${entryIndex}`] ??
                                  subKey
                                }
                                onChange={(e) => {
                                  const rid = `${index}-${entryIndex}`;
                                  const newDraft = e.target.value;
                                  setDraftGcalKeys((prev) => ({
                                    ...prev,
                                    [rid]: newDraft,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const rid = `${index}-${entryIndex}`;
                                  const newKey = e.target.value;
                                  if (newKey === subKey) {
                                    setDraftGcalKeys((prev) => {
                                      const next = { ...prev };
                                      delete next[rid];
                                      return next;
                                    });
                                    return;
                                  }
                                  setEditableConfig((prev) => {
                                    const updatedList = [...prev[key]];
                                    const updatedItem = {
                                      ...updatedList[index],
                                    };
                                    const val = updatedItem[subKey];
                                    delete updatedItem[subKey];
                                    updatedItem[newKey] = val;
                                    updatedList[index] = updatedItem;
                                    return { ...prev, [key]: updatedList };
                                  });
                                  setDraftGcalKeys((prev) => {
                                    const next = { ...prev };
                                    delete next[rid];
                                    return next;
                                  });
                                }}
                                className={styles.input}
                              />
                              <input
                                type="text"
                                id={`gcal_dic-${index}-${entryIndex}-v`}
                                name={`gcal_dic-${index}-${entryIndex}-v`}
                                value={subVal}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setEditableConfig((prev) => {
                                    const updatedList = [...prev[key]];
                                    const updatedItem = {
                                      ...updatedList[index],
                                    };
                                    updatedItem[subKey] = newValue;
                                    updatedList[index] = updatedItem;
                                    return { ...prev, [key]: updatedList };
                                  });
                                }}
                                className={styles.input}
                              />
                              <Button
                                text="🗑️"
                                onClick={() => handleDelete(index)}
                              />
                            </>
                          ) : editMode && key === "page_property" ? (
                            <>
                              <span className={styles.nested_key}>
                                {subKey}
                              </span>
                              <input
                                type="text"
                                value={subVal}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setEditableConfig((prev) => {
                                    const updatedList = [...prev[key]];
                                    const updatedItem = {
                                      ...updatedList[index],
                                    };
                                    updatedItem[subKey] = newValue;
                                    updatedList[index] = updatedItem;
                                    return { ...prev, [key]: updatedList };
                                  });
                                }}
                                className={styles.input}
                              />
                            </>
                          ) : (
                            <>
                              <span className={styles.nested_key}>
                                {subKey}
                              </span>
                              <span className={styles.nested_value}>
                                {subVal}
                              </span>
                            </>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </div>
              {editMode && key === "gcal_dic" && (
                <Button onClick={handleAdd} text={`➕ Add ${label}`} />
              )}
            </div>
          );
        }

        return (
          <div key={key} className={styles.notioncard_row}>
            <span className={styles.notioncard_key}>
              {label}
              {(key === "goback_days" || key === "goforward_days") &&
                (() => {
                  const days = parseInt(editableConfig[key], 10);
                  if (isNaN(days)) return null;
                  const now = new Date();
                  const targetDate = new Date(
                    now.getTime() +
                      (key === "goback_days" ? -days : days) *
                        24 *
                        60 *
                        60 *
                        1000,
                  );
                  const dateStr = targetDate.toISOString().split("T")[0];
                  return (
                    <div className={styles.note}>
                      ({key === "goback_days" ? "Since" : "Until"} {dateStr})
                    </div>
                  );
                })()}
            </span>
            {editMode ? (
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className={styles.input}
              />
            ) : (
              <span className={styles.notioncard_value}>
                {key === "notion_token" ? "*".repeat(16) : value}
              </span>
            )}
          </div>
        );
      })}
      {lastFetchedAt && (
        <div className={styles.note}>Last fetched from S3: {lastFetchedAt}</div>
      )}
      {lastModifiedAt && (
        <div className={styles.note}>Last modified in S3: {lastModifiedAt}</div>
      )}
      <div className={styles.note}>
        Don’t have a Notion page yet? You can use this template:{" "}
        <a
          href="https://www.notion.so/28b438de0d88819db5f6c28a33ccbfdc?v=28b438de0d8881158789000cba8aab6f"
          target="_blank"
          rel="noopener noreferrer"
        >
          Notion Template
        </a>
      </div>
      {notice && (
        <div className={styles.support_section}>
          <span className={styles.note}>{notice}</span>
        </div>
      )}

      {!editMode ? (
        <>
          <Button text="Edit Sync Configuration" onClick={handleEditClick} />
          {showFetchButton && (
            <Button
              text={loading ? "Fetching..." : "Fetch Latest Configuration"}
              onClick={fetchFromS3}
            />
          )}
        </>
      ) : (
        <>
          <Button
            text={
              loading
                ? "Saving..."
                : isCountingDown
                  ? `Please wait ${formattedRemaining} to save`
                  : "Save"
            }
            onClick={handleSaveClick}
            disabled={loading || isCountingDown}
          />
          <Button text="Cancel" onClick={handleCancelClick} />
        </>
      )}
      <RefreshNotionButton />
      <RefreshGCalButton />
      <TestConnectionButton />
      <Button text="Back to Profile" onClick={handleBackClick} />
    </div>
  );
};

export default NotionCard;
