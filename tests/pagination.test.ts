import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PaginationControls } from "../src/components/shared/pagination";

test("pagination renders navigable anchors and retains filters", () => {
  const html = renderToStaticMarkup(
    React.createElement(PaginationControls, {
      totalPages: 2,
      routePrefix: "/search",
      search: "q=React&category=frameworks-ui&page=1",
    }),
  );
  assert.match(
    html,
    /<a[^>]*aria-label="Page 2"[^>]*href="\/search\?q=React&amp;category=frameworks-ui&amp;page=2"/,
  );
  assert.match(html, /<a[^>]*aria-label="Go to next page"/);
  assert.match(html, /aria-current="page"/);
  assert.doesNotMatch(html, /<span[^>]*href=/);
  assert.doesNotMatch(html, /<a[^>]*aria-label="Go to previous page"/);
});

test("last and single pages do not expose a next-page link", () => {
  const render = (totalPages: number) =>
    renderToStaticMarkup(
      React.createElement(PaginationControls, {
        totalPages,
        routePrefix: "/",
        search: "page=2",
      }),
    );
  assert.doesNotMatch(render(2), /<a[^>]*aria-label="Go to next page"/);
  assert.equal(render(1), "");
});
