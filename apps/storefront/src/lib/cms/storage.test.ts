import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dataDir, readCms, mutateCms } from "./local-store";
import { resolveProductImage } from "../product-image";

describe("storage & media upload persistence", () => {
  it("resolves dataDir to a writable directory", () => {
    const dir = dataDir();
    assert.ok(dir && dir.length > 0, "dataDir should return a valid path");
  });

  it("persists media asset with base64 data in CMS", () => {
    const testPath = `site-media/test-upload-${Date.now()}.png`;
    const testBase64 = Buffer.from("fake-png-data").toString("base64");
    const testUrl = `/api/cms/storage/v1/object/public/${testPath}`;

    mutateCms((db) => {
      db.media_assets.push({
        id: "test-id-123",
        path: testPath,
        url: testUrl,
        alt: "test upload",
        mime_type: "image/png",
        size_bytes: 13,
        data_base64: testBase64,
        created_at: new Date().toISOString(),
      });
    });

    const refreshed = readCms();
    const found = refreshed.media_assets.find((m) => m.path === testPath);
    assert.ok(found, "persisted media asset must be found in media_assets");
    assert.equal(found.data_base64, testBase64, "base64 data must match");
    assert.equal(found.url, testUrl, "url must match");
  });

  it("resolveProductImage supports cms storage and data URLs", () => {
    const cmsUrl = "/api/cms/storage/v1/object/public/site-media/photo.jpg";
    assert.equal(resolveProductImage(cmsUrl), cmsUrl);

    const fullUrl = "https://pyrite-app-storefront.vercel.app/api/cms/storage/v1/object/public/site-media/photo.jpg";
    assert.equal(resolveProductImage(fullUrl), fullUrl);

    const dataUrl = "data:image/png;base64,iVBORw0KGgo=";
    assert.equal(resolveProductImage(dataUrl), dataUrl);
  });

  it("extractFileFromMultipart unwraps multipart payload cleanly", async () => {
    const { extractFileFromMultipart } = await import("./local-store");
    const fakeMultipart = Buffer.from(
      '------WebKitFormBoundaryXYZ\r\n' +
      'Content-Disposition: form-data; name="cacheControl"\r\n\r\n' +
      '3600\r\n' +
      '------WebKitFormBoundaryXYZ\r\n' +
      'Content-Disposition: form-data; name=""; filename="test.jpg"\r\n' +
      'Content-Type: image/jpeg\r\n\r\n' +
      'REAL_JPEG_BINARY_DATA\r\n' +
      '------WebKitFormBoundaryXYZ--'
    );

    const extracted = extractFileFromMultipart(fakeMultipart);
    assert.equal(extracted.buf.toString(), "REAL_JPEG_BINARY_DATA");
    assert.equal(extracted.mime, "image/jpeg");
    assert.equal(extracted.filename, "test.jpg");
  });

  it("re-reads from disk when cms-local.json mtime changes", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const firstRead = readCms();
    assert.ok(firstRead.products.length > 0);

    const testSlug = `cache-test-${Date.now()}`;
    const testProduct = {
      id: testSlug,
      slug: testSlug,
      name: "Cache Mtime Test Product",
      min_price: 100,
      max_price: 100,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const filePath = path.join(dataDir(), "cms-local.json");
    const diskContent = JSON.parse(fs.readFileSync(filePath, "utf8"));
    diskContent.products.push(testProduct);
    // Write directly to disk bypassing in-memory writeCms
    fs.writeFileSync(filePath, JSON.stringify(diskContent, null, 2), "utf8");
    const nextTime = new Date(Date.now() + 2000);
    fs.utimesSync(filePath, nextTime, nextTime);

    // Next readCms must detect the file mtime change and include the new product
    const secondRead = readCms();
    const found = secondRead.products.find((p) => p.slug === testSlug);
    assert.ok(found, "readCms must detect on-disk change and load new product without restart");

    // Clean up
    diskContent.products = diskContent.products.filter((p: any) => p.slug !== testSlug);
    fs.writeFileSync(filePath, JSON.stringify(diskContent, null, 2), "utf8");
  });
});
