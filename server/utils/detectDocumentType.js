import path from "path";

export function detectDocumentType({ type, filename }) {
    if (type) return type.toLowerCase();

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

    throw new Error(
        `Unable to determine document type (type=${type}, filename=${filename})`
    );
}
