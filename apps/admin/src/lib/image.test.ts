import test from "node:test";
import assert from "node:assert/strict";
import { extractGoogleDriveFileId, resolveAdminImage } from "./image";

test("extractGoogleDriveFileId", () => {
  assert.equal(
    extractGoogleDriveFileId("https://drive.google.com/file/d/1AmbS3LE31iItGMkx9ECeIYYeoEyblGO5/view?usp=sharing"),
    "1AmbS3LE31iItGMkx9ECeIYYeoEyblGO5"
  );
  assert.equal(
    extractGoogleDriveFileId("https://drive.google.com/uc?id=1AmbS3LE31iItGMkx9ECeIYYeoEyblGO5"),
    "1AmbS3LE31iItGMkx9ECeIYYeoEyblGO5"
  );
  assert.equal(extractGoogleDriveFileId(""), null);
  assert.equal(extractGoogleDriveFileId("https://example.com/photo.png"), null);
});

test("resolveAdminImage", () => {
  // Google Drive -> lh3 CDN
  assert.equal(
    resolveAdminImage("https://drive.google.com/file/d/1AmbS3LE31iItGMkx9ECeIYYeoEyblGO5/view?usp=sharing"),
    "https://lh3.googleusercontent.com/d/1AmbS3LE31iItGMkx9ECeIYYeoEyblGO5=w400"
  );

  // Relative path -> storefront origin
  assert.equal(
    resolveAdminImage("/Giftvibes%20categories/NEW%20YEAR%20DIARY.png"),
    "https://pyrite-app-storefront.vercel.app/Giftvibes%20categories/NEW%20YEAR%20DIARY.png"
  );

  // Absolute or data URL -> unchanged
  assert.equal(
    resolveAdminImage("https://images.unsplash.com/photo-123"),
    "https://images.unsplash.com/photo-123"
  );
  assert.equal(
    resolveAdminImage("data:image/png;base64,abc"),
    "data:image/png;base64,abc"
  );

  // Empty / null -> empty string
  assert.equal(resolveAdminImage(null), "");
  assert.equal(resolveAdminImage(""), "");
});
