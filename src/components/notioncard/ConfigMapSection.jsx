"use client";

import React, { useMemo, useCallback, useState } from "react";
import Button from "@components/button/Button";
import styles from "./notioncard.module.css";

/**
 * ConfigMapSection
 *
 * mapValue supports both {k:v} and [{k:v}] (legacy array-of-one).
 */
export default function ConfigMapSection({
  title,
  mapKey, // "basic" | "gcal_dic" | "page_property"
  mapValue, // object or [{object}]
  editMode,
  setEditableConfig,
  allowKeyEdit = false,
  allowAdd = false,
  allowDelete = false,
}) {
  // Normalize to object for rendering
  const obj = useMemo(
    () => (Array.isArray(mapValue) ? mapValue[0] || {} : mapValue || {}),
    [mapValue],
  );

  // Draft key text only used when keys are editable
  const [draftKeys, setDraftKeys] = useState({}); // rid -> draftKeyText

  // Generic write with shape preservation (and flat-merge for "basic")
  const writeBack = useCallback(
    (updater) => {
      setEditableConfig((prev) => {
        if (mapKey === "basic") {
          // Merge updated values into the ROOT config
          const nextRoot = updater({ ...prev });
          return { ...prev, ...nextRoot };
        }

        // For nested maps: keep original shape ({} or [{}])
        const prevVal = prev[mapKey];
        const wasArray = Array.isArray(prevVal);
        const base = wasArray ? prevVal[0] || {} : prevVal || {};
        const nextObj = updater({ ...base });
        const nextVal = wasArray ? [nextObj] : nextObj;

        return { ...prev, [mapKey]: nextVal };
      });
    },
    [mapKey, setEditableConfig],
  );

  // Update value
  const updateValue = useCallback(
    (k, v) => {
      writeBack((m) => {
        m[k] = v; // for basic, m is the root; for map, m is the map object
        return m;
      });
    },
    [writeBack],
  );

  // Delete key (disabled for basic)
  const deleteKey = useCallback(
    (k) => {
      if (!allowDelete) return;
      writeBack((m) => {
        delete m[k];
        return m;
      });
    },
    [writeBack, allowDelete],
  );

  // Add pair (disabled for basic)
  const addPair = useCallback(() => {
    if (!allowAdd) return;
    writeBack((m) => {
      let i = 1;
      while (m[`new_key_${i}`] !== undefined) i++;
      m[`new_key_${i}`] = "";
      return m;
    });
  }, [writeBack, allowAdd]);

  // Rename key (disabled for basic or when allowKeyEdit=false)
  const commitRename = useCallback(
    (oldK, newK) => {
      if (!allowKeyEdit) return;
      const nk = (newK || "").trim();
      if (!nk || nk === oldK) return;
      writeBack((m) => {
        if (Object.prototype.hasOwnProperty.call(m, nk)) return m; // guard duplicate
        const val = m[oldK];
        delete m[oldK];
        m[nk] = val;
        return m;
      });
    },
    [writeBack, allowKeyEdit],
  );

  return (
    <div className={styles.section_block}>
      <h4 className={styles.section_title}>{title}</h4>

      <div className={styles.nested_list}>
        {Object.entries(obj).map(([k, v], idx) => {
          const rid = `${mapKey}-${idx}`;
          const draft = draftKeys[rid] ?? k;

          // detect numeric-ish fields to render number input (optional UX)
          const isNumericField =
            typeof v === "number" ||
            [
              "goback_days",
              "goforward_days",
              "default_event_length",
              "default_start_time",
            ].includes(k);

          return (
            <div key={`${mapKey}-${k}`} className={styles.nested_row}>
              {editMode ? (
                <>
                  {/* Key cell */}
                  {allowKeyEdit ? (
                    <input
                      className={styles.input}
                      value={draft}
                      onChange={(e) =>
                        setDraftKeys((d) => ({ ...d, [rid]: e.target.value }))
                      }
                      onBlur={(e) => {
                        commitRename(k, e.target.value);
                        setDraftKeys((d) => {
                          const n = { ...d };
                          delete n[rid];
                          return n;
                        });
                      }}
                    />
                  ) : (
                    <span className={styles.nested_key}>{k}</span>
                  )}

                  {/* Value cell */}
                  <input
                    className={styles.input}
                    type={isNumericField ? "number" : "text"}
                    value={v}
                    onChange={(e) =>
                      updateValue(
                        k,
                        isNumericField && e.target.value !== ""
                          ? Number(e.target.value)
                          : e.target.value,
                      )
                    }
                  />

                  {/* Delete button */}
                  {allowDelete && (
                    <Button text="🗑️" onClick={() => deleteKey(k)} />
                  )}
                </>
              ) : (
                <>
                  <span className={styles.nested_key}>{k}</span>
                  <span className={styles.nested_value}>{String(v)}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add button */}
      {editMode && allowAdd && (
        <Button onClick={addPair} text={`➕ Add ${title}`} />
      )}
    </div>
  );
}
