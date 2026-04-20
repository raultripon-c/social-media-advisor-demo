const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const packageJson = require("../package.json");

function findMapFiles(dir) {
  const files = [];
  function walkDir(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      items.forEach((item) => {
        if (item === "node_modules" || item === ".git") return;
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) walkDir(fullPath);
        else if (item.endsWith(".map")) files.push(fullPath);
      });
    } catch (err) {
      console.warn(`Warning: Could not access ${currentPath}:`, err.message);
    }
  }
  walkDir(dir);
  return files;
}

async function uploadSourceMaps() {
  const buildDir = path.resolve(
    __dirname,
    "..",
    process.env.BUILD_OUTPUT_DIR || "dist"
  );
  const apiBaseUrl =
    process.env.API_BASE_URL || "https://apm-pholly.phenom.com/api";

  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  const mapFiles = findMapFiles(buildDir);
  if (mapFiles.length === 0) {
    console.log("No sourcemap files found in:", buildDir);
    return;
  }

  console.log(
    `Found ${mapFiles.length} sourcemap file(s):`,
    mapFiles.map((f) => path.basename(f))
  );

  const serviceName =
    process.env.REACT_APP_CLIENT ||
    process.env.APP_CLIENT_ID ||
    packageJson.name ||
    "txe-ui";
  const releaseTag =
    process.env.REACT_APP_DEPLOYMENT_TAG || packageJson.version || "0.0.0";
  const environment =
    process.env.REACT_APP_PHOLLY_ENVIRONMENT ||
    process.env.REACT_APP_ENVIRONMENT ||
    process.env.APP_ENV ||
    "INTQA";
  const bitBucketUrl =
    process.env.BITBUCKET_URL ||
    "https://bitbucket.org/phenompeople/pe-servicehub-tools-ui";

  const formData = new FormData();
  formData.append("serviceName", serviceName);
  formData.append("releaseTag", releaseTag);
  formData.append("environment", environment);
  formData.append("bitBucketUrl", bitBucketUrl);

  console.log("\nUpload details:");
  console.log(`  Service: ${serviceName}`);
  console.log(`  Release Tag: ${releaseTag}`);
  console.log(`  Environment: ${environment}`);
  console.log(`  API URL: ${apiBaseUrl}/sourcemaps/upload-sourcemaps`);

  mapFiles.forEach((filePath) => {
    const fileName = path.basename(filePath);
    formData.append("files", fs.createReadStream(filePath), {
      filename: fileName,
      contentType: "application/json",
    });
  });

  console.log("\nUploading sourcemaps...");
  try {
    const response = await axios.post(
      `${apiBaseUrl}/sourcemaps/upload-sourcemaps`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000,
      }
    );
    console.log("\nSourcemaps uploaded successfully.");
    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.data) {
      console.log("   Response:", JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error("\nFailed to upload sourcemaps:");
    if (error.response) {
      console.error(
        `   Status: ${error.response.status} ${error.response.statusText}`
      );
      console.error(
        "   Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error(`   URL: ${error.config?.url}`);
    } else if (error.request) {
      console.error("   No response received from server");
      console.error(`   Request URL: ${error.config?.url}`);
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    throw error;
  }
}

if (require.main === module) {
  uploadSourceMaps()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { uploadSourceMaps };
