#!/usr/bin/env node
// Copy partials/navbar.html into every page, between the navbar:start / navbar:end markers.
//
// Usage: node scripts/sync-navbar.mjs [--check]
//   --check  only report pages whose navbar is out of date (exit 1 if any)
//
// Template placeholders:
//   {{root}}       path from the page back to the site root ("" or "../")
//   {{active:X}}   " active" on page X, empty elsewhere
//   {{current:X}}  screen-reader "(current)" label on page X, empty elsewhere

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// page file -> navbar keys marked active on it
const pages = {
  "index.html": ["home"],
  "cv/index.html": ["cv"],
  "publications.html": ["works", "publications"],
  "projects.html": ["works", "projects"],
  "contact.html": ["contact"],
};

const START = "<!-- navbar:start -->";
const END = "<!-- navbar:end -->";

const template = readFileSync(join(root, "partials/navbar.html"), "utf8").trimEnd();
const check = process.argv.includes("--check");
let stale = 0;

for (const [page, active] of Object.entries(pages)) {
  const file = join(root, page);
  const html = readFileSync(file, "utf8");
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    console.error(`${page}: missing ${START} / ${END} markers`);
    process.exit(2);
  }

  const prefix = relative(dirname(file), root).replace(/\\/g, "/");
  const navbar = template
    .replaceAll("{{root}}", prefix ? `${prefix}/` : "")
    .replace(/\{\{active:(\w+)\}\}/g, (_, key) => (active.includes(key) ? " active" : ""))
    .replace(/\{\{current:(\w+)\}\}/g, (_, key) =>
      active.includes(key) ? ' <span class="visually-hidden">(current)</span>' : "",
    );

  const updated = `${html.slice(0, start + START.length)}\n${navbar}\n  ${html.slice(end)}`;
  if (updated === html) continue;

  stale++;
  if (check) {
    console.log(`${page}: navbar out of date`);
  } else {
    writeFileSync(file, updated);
    console.log(`${page}: navbar updated`);
  }
}

if (check && stale) process.exit(1);
if (!stale) console.log("All navbars up to date");
