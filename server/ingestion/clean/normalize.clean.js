export function normalizeText(text) {
    return text
        .replace(/\u00A0/g, " ")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/-\n/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
