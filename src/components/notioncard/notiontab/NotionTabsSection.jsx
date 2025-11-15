"use client";

import {
  FIELD_META,
  prettify,
  calcDateFromToday,
  offsetFromTimeZone,
} from "@utils/client/field-meta";
import React, { useMemo, useCallback, useState } from "react";
import Button from "@components/button/Button";
import styles from "./notiontab.module.css";

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

  // Update with dependencies (e.g., timecode depends on timezone)
  const updateWithDeps = useCallback(
    (k, v) => {
      writeBack((m) => {
        m[k] = v;

        // Handle dependencies: Update timecode accordingly
        if (k === "timezone") {
          m.timecode = offsetFromTimeZone(v, new Date());
        }
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

  // Allow adding new pair when allowAdd
  const addPair = useCallback(() => {
    if (!allowAdd) return;
    writeBack((m) => {
      let i = 1;
      while (m[`new_key_${i}`] !== undefined) i++;
      m[`new_key_${i}`] = "";
      return m;
    });
  }, [writeBack, allowAdd]);

  // Rename key when allowKeyEdit
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
  // Normalize to object for rendering
  const obj = useMemo(
    () => (Array.isArray(mapValue) ? mapValue[0] || {} : mapValue || {}),
    [mapValue],
  );

  // Sort entries based on FIELD_META order
  const metaMap = FIELD_META[mapKey] || {};
  let entries = Object.entries(obj);

  // Only sort "basic" section
  if (mapKey === "basic") {
    entries = entries.sort((a, b) => {
      const oa = metaMap[a[0]]?.order ?? 9e9;
      const ob = metaMap[b[0]]?.order ?? 9e9;
      return oa - ob || a[0].localeCompare(b[0]);
    });
  }

  return (
    <>
      <div className={styles.nested_list}>
        {entries.map(([k, v], idx) => {
          // Unique row id for draft key tracking
          // key and value cells
          const rid = `${mapKey}-${idx}`;
          const draft = draftKeys[rid] ?? k;
          const meta = metaMap[k] || {};
          const label = meta.label || prettify(k);
          const isNumericField = meta.type === "number";
          const showDate = meta.showDate === true;
          const zones = Intl.supportedValuesOf("timeZone");

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
                    <span className={styles.nested_key}>{label}</span>
                  )}

                  {/* Value cell */}

                  {meta.type === "select" ? (
                    <select
                      className={styles.input}
                      value={v ?? ""}
                      onChange={(e) => updateWithDeps(k, e.target.value)}
                    >
                      {/* {(meta.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))} */}
                      {zones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  ) : meta.type === "readonly" ? (
                    <span className={styles.static_value}>{v ?? "-"}</span>
                  ) : (
                    // other fields
                    <input
                      className={styles.input}
                      type={isNumericField ? "number" : "text"}
                      value={v ?? ""}
                      onChange={(e) =>
                        updateValue(
                          k,
                          isNumericField && e.target.value !== ""
                            ? Number(e.target.value)
                            : e.target.value,
                        )
                      }
                    />
                  )}

                  {/* Delete button */}
                  {allowDelete && (
                    <Button text="🗑️" onClick={() => deleteKey(k)} />
                  )}
                </>
              ) : (
                <>
                  <span className={styles.nested_key}>
                    {label}
                    {showDate && (
                      <span className={styles.note}>
                        {" "}
                        {calcDateFromToday(Number(v), k)}
                      </span>
                    )}
                  </span>
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
    </>
  );
}
