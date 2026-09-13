import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api/client.js";
import { MetricCard } from "../components/MetricCard.jsx";
function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api
            .get("/reports/summary")
            .then((res) => setSummary(res.data.data))
            .catch((err) => setError(err.response?.data?.message || "Could not load dashboard metrics"));
    }, []);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <div className="page-subtitle">A snapshot of your workspace's documents and activity.</div>
                </div>
            </div>

            {error && (
                <div className="panel" style={{ padding: 18 }}>
                    <span className="error-text" style={{ margin: 0 }}>{error}</span>
                </div>
            )}

            {summary && (
                <>
                    <div className="metric-grid">
                        <MetricCard label="Total files" value={summary.totalFiles} />
                        <MetricCard label="Storage used" value={formatBytes(summary.totalStorageBytes)} />
                        <MetricCard label="Active users" value={summary.activeUsers} />
                        <MetricCard label="Jobs queued" value={summary.jobsQueued} />
                    </div>

                    <div className="panel" style={{ marginBottom: 24 }}>
                        <div className="panel-header">
                            <span className="panel-title">Uploads, last 30 days</span>
                        </div>
                        <div style={{ padding: "20px 12px 8px" }}>
                            {summary.uploadsByDay?.length ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={summary.uploadsByDay}>
                                        <CartesianGrid stroke="#E1E3E0" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: "#5B6672" }}
                                            tickFormatter={(d) => d.slice(5)}
                                        />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#5B6672" }} width={28} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" stroke="#276A63" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state" style={{ padding: "24px 0" }}>
                                    No uploads in the last 30 days yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <span className="panel-title">Files by status</span>
                        </div>
                        <div style={{ display: "flex", gap: 24, padding: 18, flexWrap: "wrap" }}>
                            {Object.entries(summary.filesByStatus || {}).map(([status, count]) => (
                                <div key={status}>
                                    <div className="metric-label" style={{ textTransform: "capitalize" }}>{status}</div>
                                    <div className="metric-value" style={{ fontSize: 22 }}>{count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
