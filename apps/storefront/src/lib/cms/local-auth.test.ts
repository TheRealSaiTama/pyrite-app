import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import {
  signLocalCmsToken,
  verifyLocalCmsCredentials,
  verifyLocalCmsToken,
  type LocalCmsToken,
} from "./local-auth";

const original = {
  nodeEnv: process.env.NODE_ENV,
};
const env = process.env as Record<string, string | undefined>;

beforeEach(() => {
  env.NODE_ENV = "test";
});

after(() => {
  if (original.nodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = original.nodeEnv;
});

function token(overrides: Partial<LocalCmsToken> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return signLocalCmsToken({
    sub: "owner-id",
    email: "owner@example.com",
    role: "authenticated",
    aud: "authenticated",
    token_use: "access",
    exp: now + 60,
    ...overrides,
  });
}

test("verifies signed access and refresh tokens", () => {
  const access = token();
  const refresh = token({ token_use: "refresh" });
  assert.ok(access);
  assert.ok(refresh);
  assert.equal(verifyLocalCmsToken(access, "access")?.email, "owner@example.com");
  assert.equal(verifyLocalCmsToken(refresh, "refresh")?.email, "owner@example.com");
  assert.equal(verifyLocalCmsToken(refresh, "access"), null);
});

test("rejects invalid, altered, and expired tokens", () => {
  const valid = token();
  assert.equal(verifyLocalCmsToken("not-a-token"), null);
  assert.ok(valid);
  assert.equal(verifyLocalCmsToken(`${valid.slice(0, -1)}x`), null);
  assert.equal(verifyLocalCmsToken(token({ exp: 1 }) || ""), null);
});

test("production local CMS sign-in is disabled", () => {
  env.NODE_ENV = "production";
  assert.equal(verifyLocalCmsCredentials("owner@example.com", "password"), false);
  assert.equal(token(), null);
  assert.equal(verifyLocalCmsToken("not-a-token"), null);
});
