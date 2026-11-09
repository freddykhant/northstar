export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** JSON for embedding inside an inline <script>; `<` is escaped so `</script>` can't close it. */
export function jsString(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const css = `
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:#be9fe0;color:#31356b;
font-family:ui-rounded,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
line-height:1.5;display:flex;justify-content:center;padding:32px 20px}
main{width:100%;max-width:480px;text-align:center}
img.squid{width:120px;height:auto;image-rendering:pixelated;margin:8px auto 16px;display:block}
h1{font-size:1.9rem;margin:0 0 12px}
p{margin:0 0 14px;font-size:1.05rem}
code{background:#31356b;color:#fdb6c0;padding:.45em .8em;border-radius:10px;font-size:1.05rem;display:inline-block}
ul{text-align:left;display:inline-block;margin:0 0 14px;padding-left:1.2em}
a{color:#31356b}
button{display:block;width:100%;margin:10px 0;padding:14px 18px;font:inherit;font-weight:600;
color:#31356b;background:#fdb6c0;border:2px solid #31356b;border-radius:14px;cursor:pointer}
button:hover,button:focus-visible{background:#fff;outline:none}
.note{font-size:.9rem;opacity:.85}
`;

export function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${css}</style>
</head>
<body>
<main>
<img class="squid" src="/squid.png" alt="Squii, a friendly squid" width="120">
${body}
</main>
</body>
</html>`;
}
