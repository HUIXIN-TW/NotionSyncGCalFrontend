"use client";

import styles from "./fileinput.module.css";

const FileInput = ({ onFileSelect }) => {
  const handleChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
    }

    onFileSelect(file); // Pass the selected file to the parent component
  };

  return (
    <input
      className={styles.file_input}
      type="file"
      accept="application/json"
      onChange={handleChange}
      style={{ display: "none" }}
      id="file-input"
    />
  );
};

export default FileInput;