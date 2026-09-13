const LABELS = {
    pending: "Pending",
    processing: "Processing",
    processed: "Done",
    failed: "Failed",
};

export function StatusBadge({ status }) {
    const label = LABELS[status] || status;
    return (
        <span className={`badge badge-${status}`}>
            <span className="badge-dot" />
            {label}
        </span>
    );
}
