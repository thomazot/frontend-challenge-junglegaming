import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.resolve(__dirname, "../src/tokens.json");
const outputPath = path.resolve(__dirname, "../src/styles/tokens.css");

if (!fs.existsSync(tokensPath)) {
  console.error("tokens.json not found!");
  process.exit(1);
}

const tokensData = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));

let cssContent = `/* 
  AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY. 
  To update colors, replace src/tokens.json and run 'pnpm generate:tokens'
*/
@theme inline {
`;

function extractTokens(obj, prefix = "") {
  for (const key in obj) {
    if (key.startsWith("$")) continue;

    const value = obj[key];
    
    // If it's a token node
    if (value && typeof value === "object" && value["$type"] === "color") {
      const hex = value["$value"]?.hex || value["$value"];
      if (hex) {
        const cssVarName = `--color-${prefix}${key}`;
        cssContent += `  ${cssVarName}: ${hex};\n`;
      }
    } else if (value && typeof value === "object") {
      let newPrefix = prefix;
      if (key !== "color") {
        newPrefix += `${key}-`;
      }
      extractTokens(value, newPrefix);
    }
  }
}

extractTokens(tokensData);

cssContent += `}
`;

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, cssContent, "utf-8");
console.log("Successfully generated src/styles/tokens.css from src/tokens.json");
