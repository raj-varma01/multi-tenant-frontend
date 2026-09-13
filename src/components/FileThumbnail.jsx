import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const EXT_LABEL = (mimeType) => {
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType?.includes("wordprocessingml")) return "DOC";
    return "IMG";
};

export function FileThumbnail({ file }) {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        let cancelled = false;
        if (file.status === "processed" && file.thumbnailKey) {
            api
                .get(`/files/${file._id}/thumbnail`)
                .then((res) => {
                    if (!cancelled) setUrl(res.data.data.url);
                })
                .catch(() => { });
        }
        return () => {
            cancelled = true;
        };
    }, [file._id, file.status, file.thumbnailKey]);

    return (
        <div className="table-thumb">
            {url ? <img src={url} alt="" /> : EXT_LABEL(file.mimeType)}
        </div>
    );
}
