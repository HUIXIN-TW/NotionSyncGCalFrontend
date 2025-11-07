"use client";
import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";
import React, { useState, useEffect } from "react";
import styles from "./notioncard.module.css";
import SaveButton from "@components/button/SaveButton";
import FetchButton from "@/components/button/FetchButton";
import NewUserWelcomeSection from "@components/callout/NewUserWelcomeSection";
import NewUserSignOutSection from "@components/callout/NewUserSignOutSection";
import NotionCardNoteSection from "@components/notioncard/NotionCardNoteSection";
import ConfigMapSection from "@/components/notioncard/notiontab/NotionTabsSection";
import NotionTabs from "@/components/notioncard/notiontab/NotionTabs";
import { loadRemoteConfig } from "@/utils/client/load-remote-config";

const NotionCard = ({ session }) => {
  const [editMode, setEditMode] = useState(false);
  const [editableConfig, setEditableConfig] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [lastModifiedAt, setLastModifiedAt] = useState(null);
  const [showFetchButton, setShowFetchButton] = useState(!isProd);
  const [activeTab, setActiveTab] = useState("basic");
  const isNewUser = localStorage.getItem("newUser:v1") === "true";
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    const local = localStorage.getItem("notionConfig");
    const timestamp = localStorage.getItem("notionConfigFetchedAt");
    const modified = localStorage.getItem("notionConfigLastModified");

    if (isNewUser) {
      setEditMode(true);
    }

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
    loadRemoteConfig({
      setEditableConfig,
      setLastFetchedAt,
      setLastModifiedAt,
    });
  }, []);

  if (!editableConfig) return <div>Loading configuration...</div>;
  if (!session?.user)
    return <div>Please log in to view your configuration.</div>;

  const basicObject = Object.keys(editableConfig)
    .filter((k) => k !== "gcal_dic" && k !== "page_property")
    .reduce((acc, k) => ({ ...acc, [k]: editableConfig[k] }), {});

  const gcalObjectOrArray = Array.isArray(editableConfig.gcal_dic)
    ? editableConfig.gcal_dic[0] || {}
    : editableConfig.gcal_dic || {};

  const pagePropObjectOrArray = Array.isArray(editableConfig.page_property)
    ? editableConfig.page_property[0] || {}
    : editableConfig.page_property || {};

  return (
    <div className={styles.notioncard_container}>
      {isNewUser && <NewUserWelcomeSection />}

      {/* Tabs */}
      <NotionTabs
        onChange={setActiveTab}
        value={activeTab}
        editMode={editMode}
        setEditMode={setEditMode}
        setEditableConfig={setEditableConfig}
      />

      <div className={styles.tab_section}>
        {/* Panels (render one at a time) */}
        {activeTab === "basic" && (
          <ConfigMapSection
            title="Basic Settings"
            mapKey="basic"
            mapValue={basicObject}
            editMode={editMode}
            setEditableConfig={setEditableConfig}
            variant="basic"
            /* no allow* props -> read-only keys, value-edit only via your writeBack('basic') */
          />
        )}

        {activeTab === "gcal" && (
          <ConfigMapSection
            title="Google Calendar Mapping"
            mapKey="gcal_dic"
            mapValue={gcalObjectOrArray} // works with {} or [{ }]
            editMode={editMode}
            setEditableConfig={setEditableConfig}
            variant="map"
            allowKeyEdit={true}
            allowAdd={true}
            allowDelete={true}
          />
        )}

        {activeTab === "page" && (
          <ConfigMapSection
            title="Page Property Mapping"
            mapKey="page_property"
            mapValue={pagePropObjectOrArray}
            editMode={editMode}
            setEditableConfig={setEditableConfig}
            variant="map"
            allowKeyEdit={false}
            allowAdd={false}
            allowDelete={false}
          />
        )}
      </div>
      <NotionCardNoteSection
        lastFetchedAt={lastFetchedAt}
        lastModifiedAt={lastModifiedAt}
        messages={messages}
      />

      {editMode ? (
        <SaveButton
          editableConfig={editableConfig}
          setEditMode={setEditMode}
          setLastFetchedAt={setLastFetchedAt}
          setShowFetchButton={setShowFetchButton}
          setMessages={setMessages}
        />
      ) : (
        <>
          {showFetchButton && (
            <FetchButton
              setEditableConfig={setEditableConfig}
              setLastFetchedAt={setLastFetchedAt}
              setLastModifiedAt={setLastModifiedAt}
            />
          )}
        </>
      )}

      {isNewUser && (
        // This button will likely call NextAuth's signOut() to clear the session
        // and force a fresh login/re-authentication cycle after setup.
        <NewUserSignOutSection />
      )}
    </div>
  );
};

export default NotionCard;
