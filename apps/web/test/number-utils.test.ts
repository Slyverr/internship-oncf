import assert from "node:assert/strict";
import { formatFileSize } from "../src/lib/format-file-size";
import { formatNumber } from "../src/lib/number-utils";

assert.equal(formatNumber(12345.6), "12,345.6");
assert.equal(formatFileSize(0), "0 B");
assert.equal(formatFileSize(512), "512 B");
assert.equal(formatFileSize(1536), "1.5 KB");
assert.equal(formatFileSize(1572864), "1.5 MB");

console.log("Locale-aware number formatting checks passed.");
