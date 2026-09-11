const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");

if (!fs.existsSync(indexPath)) {
  console.error("dist/index.html not found. Run the build first.");
  process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
console.log("Copied dist/index.html to dist/404.html for GitHub Pages SPA routing.");
