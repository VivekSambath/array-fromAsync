// Generates one HTML page per slide, plus robots.txt and sitemap.xml.
// Usage: node build-pages.mjs <output dir> <site url>
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const [outDir, siteArg] = process.argv.slice(2);
const SITE = siteArg.replace(/\/$/, "");
const SITE_NAME = "Array.fromAsync() explained";
const TODAY = "2026-10-31";

const slides = [
  {
    file: "index.html",
    title: "Array.fromAsync() explained: simple guide with examples",
    description: "A simple, visual guide to JavaScript’s Array.fromAsync(): what it does, how it works, real examples, and how it compares with Promise.all().",
    nav: "Intro",
    body: `
  <p class="eyebrow">JavaScript · ES2024</p>
  <h1 class="cover-title">Array.fromAsync()</h1>
  <p class="lead">Turn async data into a normal array, with one line of code.</p>
  <p>Use → or Space to go to the next slide.</p>`,
  },
  {
    file: "the-idea.html",
    title: "What is Array.fromAsync()? | Array.fromAsync() explained",
    description: "Array.fromAsync() is Array.from() that knows how to wait: it turns async generators, streams and arrays of promises into a normal array.",
    nav: "The idea",
    body: `
  <p class="eyebrow">The idea</p>
  <h1>It’s <code>Array.from()</code> that knows how to wait</h1>
  <div class="flow" role="img" aria-label="Async data goes into Array.fromAsync, which returns a promise of an array">
    <div class="node"><span class="label">input</span><span class="val">async data</span></div>
    <span class="arrow" aria-hidden="true">→</span>
    <div class="node solid"><span class="label">await</span><span class="val">Array.fromAsync()</span></div>
    <span class="arrow" aria-hidden="true">→</span>
    <div class="node"><span class="label">output</span><span class="val">[ a, b, c ]</span></div>
  </div>
  <p>The input can be an async generator, a stream, an array of promises, or anything you can loop over.</p>`,
  },
  {
    file: "syntax.html",
    title: "Array.fromAsync() syntax and parameters | Array.fromAsync() explained",
    description: "The syntax of Array.fromAsync(items, mapFn, thisArg): what each parameter does and why it always returns a Promise.",
    nav: "Syntax",
    body: `
  <p class="eyebrow">Syntax</p>
  <h1>One line, three arguments</h1>
<pre><code><span class="k">const</span> array = <span class="k">await</span> <span class="f">Array.fromAsync</span>(items, mapFn?, thisArg?);</code></pre>
  <ul>
    <li><code>items</code>: what you want to turn into an array</li>
    <li><code>mapFn</code>: optional, changes each item (it can be async)</li>
    <li>It always returns a <code>Promise</code>, so use <code>await</code></li>
  </ul>`,
  },
  {
    file: "how-it-works.html",
    title: "How Array.fromAsync() works, step by step | Array.fromAsync() explained",
    description: "Array.fromAsync() handles one item at a time, in order: get the item, wait for it, run mapFn, push it, and return the array when done.",
    nav: "How it works",
    body: `
  <p class="eyebrow">How it works</p>
  <h1>One item at a time, in order</h1>
  <ol class="steps" aria-label="Steps Array.fromAsync follows">
    <li class="step"><span class="num">01</span><p>Get the next item</p></li>
    <li class="step"><span class="num">02</span><p>Wait for it</p></li>
    <li class="step"><span class="num">03</span><p>Run mapFn and wait again</p></li>
    <li class="step"><span class="num">04</span><p>Push it into the array</p></li>
    <li class="step"><span class="num">05</span><p>Done? Return the array</p></li>
  </ol>
  <p>It does not ask for item 2 until item 1 has finished.</p>`,
  },
  {
    file: "example-api-pages.html",
    title: "Example: load every page of an API with Array.fromAsync()",
    description: "A real example: use an async generator and Array.fromAsync() to load every page of users from a paginated API into one array.",
    nav: "Example: API pages",
    body: `
  <p class="eyebrow">Real example 1 · API pages</p>
  <div class="split">
    <div class="stack">
      <h1>Load every page of users</h1>
      <p>The API returns 20 users per page. A generator fetches page after page until a page comes back empty.</p>
      <p><code>fromAsync</code> collects them all into one list.</p>
    </div>
<pre><code><span class="k">async function*</span> <span class="f">getUsers</span>() {
  <span class="k">let</span> page = <span class="s">1</span>;
  <span class="k">while</span> (<span class="k">true</span>) {
    <span class="k">const</span> res = <span class="k">await</span> <span class="f">fetch</span>(<span class="s">\`/api/users?page=\${page}\`</span>);
    <span class="k">const</span> users = <span class="k">await</span> res.<span class="f">json</span>();
    <span class="k">if</span> (users.length === <span class="s">0</span>) <span class="k">return</span>;
    <span class="k">yield*</span> users;
    page++;
  }
}

<span class="k">const</span> allUsers = <span class="k">await</span> <span class="f">Array.fromAsync</span>(<span class="f">getUsers</span>());
<span class="c">// [{ id: 1, … }, { id: 2, … }, …]</span></code></pre>
  </div>`,
  },
  {
    file: "example-cart.html",
    title: "Example: fetch product details with an async mapFn | Array.fromAsync()",
    description: "A real example: pass an async mapFn to Array.fromAsync() to fetch product details for a cart, one request at a time.",
    nav: "Example: cart",
    body: `
  <p class="eyebrow">Real example 2 · cart items</p>
  <div class="split">
    <div class="stack">
      <h1>Get product details for a cart</h1>
      <p>You have product IDs and need the full details for each one.</p>
      <p>The async <code>mapFn</code> sends one request at a time, which goes easy on a rate-limited API.</p>
    </div>
<pre><code><span class="k">const</span> cartIds = [<span class="s">101</span>, <span class="s">102</span>, <span class="s">103</span>];

<span class="k">const</span> products = <span class="k">await</span> <span class="f">Array.fromAsync</span>(
  cartIds,
  <span class="k">async</span> (id) =&gt; {
    <span class="k">const</span> res = <span class="k">await</span> <span class="f">fetch</span>(<span class="s">\`/api/products/\${id}\`</span>);
    <span class="k">return</span> res.<span class="f">json</span>();
  },
);
<span class="c">// [{ id: 101, name: "Mug" }, …]</span></code></pre>
  </div>`,
  },
  {
    file: "vs-promise-all.html",
    title: "Array.fromAsync() vs Promise.all(): sequential vs concurrent",
    description: "A timeline diagram comparing Array.fromAsync(), which waits for one item at a time, with Promise.all(), which waits for all at once.",
    nav: "vs Promise.all()",
    body: `
  <p class="eyebrow">Compared with Promise.all()</p>
  <h1>Waiting in line vs. all at once</h1>
  <div class="timeline" role="img" aria-label="Timeline: Array.fromAsync runs three 1-second tasks one after another for 3 seconds; Promise.all runs them together for 1 second">
    <div class="lane">
      <span class="lane-title">Array.fromAsync(): one after another, about 3 s</span>
      <div class="track">
        <div class="bar" style="left:0;width:33%;top:6px">task 1</div>
        <div class="bar" style="left:33.3%;width:33%;top:48px">task 2</div>
        <div class="bar" style="left:66.6%;width:33%;top:90px">task 3</div>
      </div>
    </div>
    <div class="lane">
      <span class="lane-title">Promise.all(): together, about 1 s</span>
      <div class="track">
        <div class="bar dim" style="left:0;width:33%;top:6px">task 1</div>
        <div class="bar dim" style="left:0;width:33%;top:48px">task 2</div>
        <div class="bar dim" style="left:0;width:33%;top:90px">task 3</div>
      </div>
    </div>
    <div class="axis"><span>0 s</span><span>1 s</span><span>2 s</span><span>3 s</span></div>
  </div>`,
  },
  {
    file: "which-to-use.html",
    title: "When to use Array.fromAsync() or Promise.all()",
    description: "Use Array.fromAsync() for async generators, streams, paginated APIs and ordered work; use Promise.all() for independent tasks.",
    nav: "Which to use",
    body: `
  <p class="eyebrow">Which one should I use?</p>
  <h1>Pick by the shape of your data</h1>
  <div class="grid">
    <div class="card">
      <h2>Use Array.fromAsync()</h2>
      <ul>
        <li>Async generators and streams</li>
        <li>Paginated APIs</li>
        <li>Order matters</li>
        <li>One request at a time</li>
      </ul>
    </div>
    <div class="card">
      <h2>Use Promise.all()</h2>
      <ul>
        <li>Independent tasks</li>
        <li>You want the fastest result</li>
        <li>An array of promises that are already running</li>
      </ul>
    </div>
  </div>`,
  },
  {
    file: "remember.html",
    title: "The one rule to remember | Array.fromAsync() explained",
    description: "If you can loop over it with for await, Array.fromAsync() can turn it into an array.",
    nav: "Remember",
    body: `
  <p class="eyebrow">Remember</p>
  <h1 class="big">If it can be looped over with <code>for await</code>, it can become an array.</h1>`,
  },
  {
    file: "good-to-know.html",
    title: "Array.fromAsync() errors and browser support",
    description: "How Array.fromAsync() handles errors and infinite sources, and which browsers support it: Chrome and Edge 121, Firefox 115, Safari 16.4, Node.js 22.",
    nav: "Good to know",
    body: `
  <p class="eyebrow">Good to know</p>
  <h1>Before you ship it</h1>
  <div class="grid">
    <div class="card">
      <h2>Errors</h2>
      <p>If any item or <code>mapFn</code> fails, the whole promise rejects. Wrap it in <code>try / catch</code>.</p>
    </div>
    <div class="card">
      <h2>Infinite sources</h2>
      <p>An endless generator never finishes, so the promise never resolves.</p>
    </div>
    <div class="card">
      <h2>Support</h2>
      <p>Chrome / Edge 121, Firefox 115, Safari 16.4, Node.js 22.</p>
    </div>
  </div>
  <p>Source: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync" rel="noopener">MDN · Array.fromAsync()</a></p>`,
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
// index.html is served at the site root.
const url = (file) => (file === "index.html" ? `${SITE}/` : `${SITE}/${file}`);
const pad = (n) => String(n).padStart(2, "0");

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230e0e10'/%3E%3Ctext x='32' y='42' font-family='monospace' font-size='28' font-weight='700' fill='%23f4f4f5' text-anchor='middle'%3E[]%3C/text%3E%3C/svg%3E";

slides.forEach((s, i) => {
  const prev = slides[i - 1];
  const next = slides[i + 1];
  const total = slides.length;

  const jsonLd = i === 0
    ? `
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: SITE_NAME,
  description: s.description,
  url: url(s.file),
  inLanguage: "en",
  learningResourceType: "Presentation",
  educationalLevel: "Beginner",
  about: { "@type": "Thing", name: "Array.fromAsync() in JavaScript" },
  hasPart: slides.slice(1).map((p) => ({ "@type": "WebPage", name: p.title, url: url(p.file) })),
}, null, 2)}
</script>`
    : `
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: url("index.html") },
    { "@type": "ListItem", position: 2, name: s.nav, item: url(s.file) },
  ],
}, null, 2)}
</script>`;

  const prevLink = prev
    ? `<a rel="prev" href="${prev.file === "index.html" ? "./" : prev.file}" aria-label="Previous: ${esc(prev.nav)}">← <span class="nav-label">${prev.nav}</span></a>`
    : `<span class="off" aria-hidden="true">←</span>`;
  const nextLink = next
    ? `<a rel="next" href="${next.file}" aria-label="Next: ${esc(next.nav)}"><span class="nav-label">${next.nav}</span> →</a>`
    : `<a href="./" aria-label="Back to start"><span class="nav-label">Back to start</span> ↺</a>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.title)}</title>
<meta name="description" content="${esc(s.description)}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0e0e10">
<link rel="canonical" href="${url(s.file)}">
${prev ? `<link rel="prev" href="${url(prev.file)}">\n` : ""}${next ? `<link rel="next" href="${url(next.file)}">\n` : ""}<link rel="icon" href="${favicon}">

<meta property="og:type" content="${i === 0 ? "website" : "article"}">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:title" content="${esc(s.title)}">
<meta property="og:description" content="${esc(s.description)}">
<meta property="og:url" content="${url(s.file)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(s.title)}">
<meta name="twitter:description" content="${esc(s.description)}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="styles.css">
<script src="nav.js" defer></script>${jsonLd}
</head>
<body>
<main class="slide">
${s.body.replace(/^\n/, "")}

  <nav class="deck-nav" aria-label="Slides">
    ${prevLink}
    <span>${pad(i + 1)} / ${total}</span>
    ${nextLink}
  </nav>
</main>
</body>
</html>
`;
  writeFileSync(join(outDir, s.file), html);
});

writeFileSync(join(outDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

writeFileSync(
  join(outDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slides.map((s) => `  <url><loc>${url(s.file)}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`,
);

console.log(`Wrote ${slides.length} pages, robots.txt and sitemap.xml to ${outDir}`);
