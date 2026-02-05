import path from "path";

/**
 * Detect document type using:
 * 1. mimetype (primary, authoritative)
 * 2. filename extension (fallback)
 *
 * Throws if type cannot be determined.
 */
export function detectDocumentType({ mimetype, filename, type }) {
    // 0. Explicit type always wins (if already set)
    if (type) {
        return type.toLowerCase();
    }

    // 1. Detect from mimetype
    if (mimetype) {
        switch (mimetype.toLowerCase()) {
            case "application/pdf":
                return "pdf";

            case "text/html":
                return "html";

            case "text/plain":
                return "txt";

            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "docx";

            default:
                break;
        }
    }

    // 2. Fallback: detect from filename extension
    if (filename) {
        const ext = path.extname(filename).toLowerCase();

        switch (ext) {
            case ".pdf":
                return "pdf";
            case ".html":
            case ".htm":
                return "html";
            case ".docx":
                return "docx";
            case ".txt":
                return "txt";
            default:
                break;
        }
    }

    // 3. Fail fast (do NOT guess)
    throw new Error(
        `Unable to determine document type (mimetype=${mimetype}, filename=${filename})`
    );
}
