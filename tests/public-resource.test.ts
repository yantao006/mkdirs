import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAddress, publicResourceUrl } from "../src/lib/public-resource";

test("AI fetch URLs reject local hosts, IP literals, alternate ports and credentials", () => {
  for (const url of [
    "http://localhost",
    "http://127.0.0.1",
    "http://2130706433",
    "http://[::1]",
    "http://metadata.google.internal",
    "https://user:secret@example.com",
    "https://example.com:8080",
    "file:///etc/passwd",
    "https://server.local",
  ]) {
    assert.throws(() => publicResourceUrl(url), url);
  }
  assert.equal(
    publicResourceUrl("https://react.dev/learn").hostname,
    "react.dev",
  );
});

test("DNS results must be public addresses, not private, mapped or malformed addresses", () => {
  for (const address of [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "fd00::1",
    "2001:db8::1",
    "8..8.8",
    "not-an-ip",
  ]) {
    assert.equal(isPublicAddress(address), false, address);
  }
  assert.equal(isPublicAddress("1.1.1.1"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});
