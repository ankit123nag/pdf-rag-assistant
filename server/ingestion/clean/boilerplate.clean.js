export function removeBoilerplate(text) {
    return text
        .replace(/Page \d+ of \d+/gi, "")
        .replace(/©.*$/gim, "")
        .replace(/Confidential|All rights reserved/gi, "")
        .trim();
}
