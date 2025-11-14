"use client";
import logger from "@utils/shared/logger";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./notioncard.module.css";
import SaveButton from "@components/button/SaveButton";
import NewUserWelcomeCalloutSection from "@components/callout/NewUserWelcomeCalloutSection";
import NewUserSignOutCalloutSection from "@components/callout/NewUserSignOutCalloutSection";
import NotionCardNoteSection from "@components/notioncard/NotionCardNoteSection";
import ConfigMapSection from "@components/notioncard/notiontab/NotionTabsSection";
import NotionTabs from "@components/notioncard/notiontab/NotionTabs";
import { useNotionConfig } from "@/hooks/useNotionConfig";

const NotionCard = ({ session }) => {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [messages, setMessages] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const { editableConfig, setEditableConfig, loading, error, reload } =
    useNotionConfig();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const flag = window.localStorage.getItem("newUser:v1") === "true";
      setIsNewUser(flag);
      if (flag) setEditMode(true);
    } catch (e) {
      logger.warn("[NotionCard] failed to read newUser flag", e);
    }
  }, []);

  const basicObject = useMemo(() => {
    if (!editableConfig) return {};

    return Object.keys(editableConfig)
      .filter((k) => k !== "gcal_dic" && k !== "page_property")
      .reduce((acc, k) => ({ ...acc, [k]: editableConfig[k] }), {});
  }, [editableConfig]);

  const gcalObjectOrArray = useMemo(() => {
    if (!editableConfig || !editableConfig.gcal_dic) return {};

    return Array.isArray(editableConfig.gcal_dic)
      ? editableConfig.gcal_dic[0] || {}
      : editableConfig.gcal_dic;
  }, [editableConfig]);

  const pagePropObjectOrArray = useMemo(() => {
    if (!editableConfig || !editableConfig.page_property) return {};

    return Array.isArray(editableConfig.page_property)
      ? editableConfig.page_property[0] || {}
      : editableConfig.page_property;
  }, [editableConfig]);

  if (!session?.user) {
    return <div>Please log in to view your configuration.</div>;
  }

  if (loading && !editableConfig) {
    return <div>Loading configuration...</div>;
  }

  if (error && !editableConfig) {
    return <div>Failed to load configuration. </div>;
  }

  if (!editableConfig) {
    return <div>No configuration found.</div>;
  }

  return (
    <div className={styles.notioncard_container}>
      {isNewUser && <NewUserWelcomeCalloutSection />}

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
      <NotionCardNoteSection messages={messages} />

      {editMode && (
        <SaveButton
          editableConfig={editableConfig}
          setEditMode={setEditMode}
          setMessages={setMessages}
        />
      )}
      {isNewUser && <NewUserSignOutCalloutSection />}
    </div>
  );
};

export default NotionCard;
