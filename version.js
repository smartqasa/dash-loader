import { readFileSync, writeFileSync } from "fs";

const pkgPath = "./package.json";
const hacsPath = "./hacs.json";

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const currentBase = `${year}.${month}`;

const currentVersion = pkg.version || "0.0.0";

let patch = 1;
if (currentVersion.startsWith(currentBase)) {
  const parts = currentVersion.split(".");
  patch = parseInt(parts[2] || "0", 10) + 1;
}

const newVersion = `${year}.${month}.${patch}`;
pkg.version = newVersion;

// Write updated package.json
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Sync version to hacs.json
const hacs = JSON.parse(readFileSync(hacsPath, "utf8"));
hacs.version = newVersion;
writeFileSync(hacsPath, JSON.stringify(hacs, null, 2));

console.log(`📦 New version: ${newVersion}`);
