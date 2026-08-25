import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const tokensPath = path.join(repoRoot, "src", "shared", "brand-tokens.css");

function loadTokens(filePath) {
    const css = readFileSync(filePath, "utf8");
    const tokens = {};
    const re = /--([a-z0-9-]+):\s*#([0-9a-fA-F]{6})\s*;/g;
    let m;
    while ((m = re.exec(css))) {
        tokens[m[1]] = `#${m[2]}`;
    }
    return tokens;
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channelLuminance(c) {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]) {
    const [rl, gl, bl] = [r, g, b].map(channelLuminance);
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hexA, hexB) {
    const la = relativeLuminance(hexToRgb(hexA));
    const lb = relativeLuminance(hexToRgb(hexB));
    const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
    return (lighter + 0.05) / (darker + 0.05);
}

// Text-on-background pairs (WCAG 1.4.3, 4.5:1) and non-text/UI-boundary
// pairs (WCAG 1.4.11, 3:1 minimum for interactive-element borders).
const REQUIRED_PAIRS = [
    { name: "text on bg", a: "color-text", b: "color-bg", min: 4.5 },
    { name: "text on surface", a: "color-text", b: "color-surface", min: 4.5 },
    { name: "accent-text on bg", a: "color-accent-text", b: "color-bg", min: 4.5 },
    { name: "accent on bg (large/UI use only)", a: "color-accent", b: "color-bg", min: 3.0 },
    // --color-accent-text vs the email card background (#242424, same value
    // as --color-surface) -- this is the pair that would have caught the
    // unstyled email link finding, had email used the token instead of a
    // hardcoded literal.
    { name: "accent-text on surface (== email card bg #242424)", a: "color-accent-text", b: "color-surface", min: 4.5 },
    // --color-text-muted now also serves as the interactive-element boundary
    // color (login's .pf-c-form-control border, and the "divider" vs
    // "UI-component-boundary" PatternFly variable split in account/admin) --
    // WCAG 1.4.11 requires 3:1, not the 4.5:1 text threshold.
    { name: "text-muted (UI boundary) on bg", a: "color-text-muted", b: "color-bg", min: 3.0 },
    { name: "text-muted (UI boundary) on surface", a: "color-text-muted", b: "color-surface", min: 3.0 },
];

const tokens = loadTokens(tokensPath);

let failed = false;

console.log("-- Contrast pairs --");
for (const { name, a, b, min } of REQUIRED_PAIRS) {
    if (!tokens[a] || !tokens[b]) {
        console.error(`FAIL: missing token(s) for "${name}" (--${a} / --${b})`);
        failed = true;
        continue;
    }
    const ratio = contrastRatio(tokens[a], tokens[b]);
    const ok = ratio >= min;
    console.log(`${ok ? "PASS" : "FAIL"}: ${name} = ${ratio.toFixed(2)}:1 (min ${min}:1)`);
    if (!ok) failed = true;
}

// --- Drift detection ---
//
// Several files intentionally duplicate brand-tokens.css's hex values as
// literals instead of consuming the CSS custom properties directly (email
// clients / early-paint scripts can't reliably use var(...), and Vite's CSS
// chunking has been observed to silently drop the imported :root block in
// some bundled chunks -- see the var(..., fallback) comments in
// src/account/custom.css, src/admin/index.css, and src/login/login.css).
// This section re-extracts those duplicated literals and asserts each one
// still matches its source-of-truth token in brand-tokens.css, so a future
// token change can't silently drift out of sync with a duplicate.

function extractDocCommentTokens(text) {
    // Same "--name: #hex" shape as brand-tokens.css itself -- used by
    // template.ftl's documentation comment block. No trailing ";" required
    // (unlike brand-tokens.css's real CSS syntax): the FTL comment is plain
    // text, e.g. "--color-accent-text: #5c8ee8 (use for links ...)".
    const tokens = {};
    const re = /--([a-z0-9-]+):\s*#([0-9a-fA-F]{6})(?![0-9a-fA-F])/g;
    let m;
    while ((m = re.exec(text))) {
        tokens[m[1]] = `#${m[2]}`;
    }
    return tokens;
}

function extractVarFallbacks(text) {
    // "var(--name, #hex)" -- the defensive fallback pattern used in
    // src/account/custom.css, src/admin/index.css, src/login/login.css.
    const tokens = {};
    const re = /var\(--([a-z0-9-]+),\s*#([0-9a-fA-F]{6})\)/g;
    let m;
    while ((m = re.exec(text))) {
        tokens[m[1]] = `#${m[2]}`;
    }
    return tokens;
}

function extractEarlyColorScheme(text) {
    // early-color-scheme.js duplicates only --color-bg, under a differently
    // named JS constant (BACKGROUND_COLOR_DARK_MODE).
    const tokens = {};
    const m = /BACKGROUND_COLOR_DARK_MODE\s*=\s*"(#[0-9a-fA-F]{6})"/.exec(text);
    if (m) {
        tokens["color-bg"] = m[1];
    }
    return tokens;
}

const DRIFT_SOURCES = [
    { file: "src/email/html/template.ftl", extract: extractDocCommentTokens },
    { file: "public/keycloak-theme/account/early-color-scheme.js", extract: extractEarlyColorScheme },
    { file: "public/keycloak-theme/admin/early-color-scheme.js", extract: extractEarlyColorScheme },
    { file: "src/account/custom.css", extract: extractVarFallbacks },
    { file: "src/admin/index.css", extract: extractVarFallbacks },
    { file: "src/login/login.css", extract: extractVarFallbacks },
];

console.log("\n-- Brand-token drift --");
for (const { file, extract } of DRIFT_SOURCES) {
    const filePath = path.join(repoRoot, file);
    const text = readFileSync(filePath, "utf8");
    const duplicated = extract(text);

    const names = Object.keys(duplicated);
    if (names.length === 0) {
        console.error(`FAIL: ${file} -- expected at least one duplicated brand-token literal, found none`);
        failed = true;
        continue;
    }

    for (const name of names) {
        const literal = duplicated[name];
        const source = tokens[name];
        if (!source) {
            console.error(`FAIL: ${file} -- literal for unknown token "--${name}" (${literal})`);
            failed = true;
            continue;
        }
        const ok = literal.toLowerCase() === source.toLowerCase();
        console.log(
            `${ok ? "PASS" : "FAIL"}: ${file} -- --${name} = ${literal} (brand-tokens.css: ${source})`,
        );
        if (!ok) failed = true;
    }
}

process.exit(failed ? 1 : 0);
