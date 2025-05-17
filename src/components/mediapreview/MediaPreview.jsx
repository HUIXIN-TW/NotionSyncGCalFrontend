"use client";

import styles from "./mediapreview.module.css";

const MediaPreview = ({ medianame }) => {
  const isVideo = medianame.endsWith(".mp4");

  return isVideo ? (
    <video
      src={`/assets/demo/${medianame}`}
      controls
      muted
      playsInline
      className={styles.video_preview}
    />
  ) : (
    <img
      src={`/assets/demo/${medianame}`}
      alt="Demo Preview"
      className={styles.video_preview}
    />
  );
};

export default MediaPreview;
