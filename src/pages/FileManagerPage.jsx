import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { api } from "../api/client.js";
import { useFileEvents } from "../hooks/useSocket.js";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { FileThumbnail } from "../components/FileThumbnail.jsx";
import { UploadDropzone } from "../components/UploadDropzone.jsx";
import { RoleGate } from "../components/RoleGate.jsx";

const ROW_HEIGHT = 49;
const VIRTUALIZE_THRESHOLD = 100;

function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

const TYPE_LABELS = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "image/png": "PNG",
    "image/jpeg": "JPEG",
};

export function FileManagerPage() {
    const [files, setFiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [status, setStatus] = useState("");
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFiles = useCallback(
        async (page = pagination.page, limit = pagination.limit) => {
            setLoading(true);
            setError("");
            try {
                const params = { page, limit };
                if (status) params.status = status;
                if (type) params.type = type;
                const res = await api.get("/files", { params });
                setFiles(res.data.data);
                setPagination(res.data.pagination);
            } catch (err) {
                setError(err.response?.data?.message || "Could not load files");
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [status, type]
    );

    useEffect(() => {
        fetchFiles(1, pagination.limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, type]);


    useFileEvents({
        onProcessed: (payload) => patchFile(payload.fileId, { status: "processed", metadata: payload.metadata, thumbnailKey: payload.thumbnailKey }),
        onFailed: (payload) => patchFile(payload.fileId, { status: "failed" }),
    });

    function patchFile(fileId, changes) {
        setFiles((prev) => prev.map((f) => (f._id === fileId ? { ...f, ...changes } : f)));
    }

    useEffect(() => {
        const inFlight = files.filter((f) => f.status === "pending" || f.status === "processing");
        if (inFlight.length === 0) return;

        const interval = setInterval(async () => {
            for (const f of inFlight) {
                try {
                    const res = await api.get(`/files/${f._id}/status`);
                    if (res.data.data.status !== f.status) {
                        patchFile(f._id, { status: res.data.data.status });
                    }
                } catch (error) {
                    console.log('error ===>>', error)
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [files]);

    async function handleDownload(file) {
        const res = await api.get(`/files/${file._id}/download`);
        window.open(res.data.data.url, "_blank", "noopener");
    }

    async function handleDelete(file) {
        if (!confirm(`Delete "${file.name}"? This can't be undone.`)) return;
        await api.delete(`/files/${file._id}`);
        setFiles((prev) => prev.filter((f) => f._id !== file._id));
        setPagination((p) => ({ ...p, total: Math.max(p.total - 1, 0) }));
    }

    function handleUploaded() {
        fetchFiles(1, pagination.limit);
    }

    const shouldVirtualize = files.length > VIRTUALIZE_THRESHOLD;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Files</h1>
                    <div className="page-subtitle">Upload, track, and manage your workspace's documents.</div>
                </div>
            </div>

            <RoleGate roles={["owner", "admin", "editor"]}>
                <div className="panel" style={{ padding: 18, marginBottom: 20 }}>
                    <UploadDropzone onUploaded={handleUploaded} />
                </div>
            </RoleGate>

            <div className="toolbar">
                <select className="field" style={{ margin: 0 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="processed">Done</option>
                    <option value="failed">Failed</option>
                </select>
                <select className="field" style={{ margin: 0 }} value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">All types</option>
                    {Object.entries(TYPE_LABELS).map(([mime, label]) => (
                        <option key={mime} value={mime}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="panel">
                {error && (
                    <div style={{ padding: 18 }}>
                        <span className="error-text" style={{ margin: 0 }}>{error}</span>
                    </div>
                )}

                {!error && (
                    <>
                        <div className="file-grid-cols file-list-header">
                            <div></div>
                            <div>Name</div>
                            <div>Type</div>
                            <div>Size</div>
                            <div>Status</div>
                            <div>Uploaded</div>
                            <div>Actions</div>
                        </div>

                        {loading ? (
                            <div className="empty-state">Loading files…</div>
                        ) : files.length === 0 ? (
                            <div className="empty-state">
                                <h3>No files yet</h3>
                                <p>Upload your first document to see it show up here.</p>
                            </div>
                        ) : shouldVirtualize ? (
                            <VirtualizedFileList files={files} onDownload={handleDownload} onDelete={handleDelete} />
                        ) : (
                            files.map((file) => (
                                <FileRow key={file._id} file={file} onDownload={handleDownload} onDelete={handleDelete} />
                            ))
                        )}

                        <div className="pagination">
                            <span>
                                Page {pagination.page} of {pagination.pages || 1} · {pagination.total} file
                                {pagination.total === 1 ? "" : "s"}
                            </span>
                            <select
                                value={pagination.limit}
                                onChange={(e) => fetchFiles(1, Number(e.target.value))}
                                style={{ border: "1px solid var(--border-strong)", borderRadius: 6, padding: "4px 8px" }}
                            >
                                {[20, 50, 100, 200].map((n) => (
                                    <option key={n} value={n}>{n} / page</option>
                                ))}
                            </select>
                            <button
                                className="btn"
                                disabled={pagination.page <= 1}
                                onClick={() => fetchFiles(pagination.page - 1, pagination.limit)}
                            >
                                Prev
                            </button>
                            <button
                                className="btn"
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => fetchFiles(pagination.page + 1, pagination.limit)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function FileRow({ file, onDownload, onDelete }) {
    return (
        <div className="file-grid-cols file-row">
            <div><FileThumbnail file={file} /></div>
            <div title={file.name}>{file.name}</div>
            <div>{TYPE_LABELS[file.mimeType] || file.mimeType}</div>
            <div>{formatBytes(file.size)}</div>
            <div><StatusBadge status={file.status} /></div>
            <div>{new Date(file.createdAt).toLocaleDateString()}</div>
            <div className="row-actions">
                <button className="btn" onClick={() => onDownload(file)}>Download</button>
                <RoleGate roles={["owner", "admin"]}>
                    <button className="btn btn-danger" onClick={() => onDelete(file)}>Delete</button>
                </RoleGate>
            </div>
        </div>
    );
}

function VirtualizedFileList({ files, onDownload, onDelete }) {
    const parentRef = useRef(null);
    const virtualizer = useVirtualizer({
        count: files.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ROW_HEIGHT,
        overscan: 8,
    });

    return (
        <div ref={parentRef} className="file-list-scroll">
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const file = files[virtualRow.index];
                    return (
                        <div
                            key={file._id}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <FileRow file={file} onDownload={onDownload} onDelete={onDelete} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
