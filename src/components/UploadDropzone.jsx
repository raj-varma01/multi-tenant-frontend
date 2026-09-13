import { useRef, useState } from "react";
import { api } from "../api/client.js";

const ACCEPTED = ".pdf,.docx,.png,.jpg,.jpeg";

export function UploadDropzone({ onUploaded }) {
    const [dragging, setDragging] = useState(false);
    const [uploads, setUploads] = useState([]);
    const inputRef = useRef(null);

    function handleFiles(fileList) {
        Array.from(fileList).forEach(uploadOne);
    }

    async function uploadOne(file) {
        const uploadId = `${file.name}-${Date.now()}`;
        setUploads((prev) => [...prev, { id: uploadId, name: file.name, progress: 0, error: null }]);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/files/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (evt) => {
                    const progress = Math.round((evt.loaded / evt.total) * 100);
                    setUploads((prev) =>
                        prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
                    );
                },
            });

            setUploads((prev) => prev.filter((u) => u.id !== uploadId));
            onUploaded?.(res.data.data);
        } catch (err) {
            const message = err.response?.data?.message || "Upload failed";
            setUploads((prev) =>
                prev.map((u) => (u.id === uploadId ? { ...u, error: message } : u))
            );
        }
    }

    return (
        <div>
            <div
                className={`dropzone${dragging ? " dragging" : ""}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED}
                    multiple
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <strong>Drop files here or click to browse</strong>
                <div className="help-text" style={{ marginTop: 6 }}>
                    PDF, DOCX, PNG, or JPG — up to 10MB each
                </div>
            </div>

            {uploads.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    {uploads.map((u) => (
                        <div key={u.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                                <span>{u.name}</span>
                                <span className={u.error ? "error-text" : "help-text"} style={{ margin: 0 }}>
                                    {u.error || `${u.progress}%`}
                                </span>
                            </div>
                            {!u.error && (
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${u.progress}%` }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
