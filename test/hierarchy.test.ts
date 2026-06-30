// Unit tests for the hierarchy/trail logic. Run with `npm test` (Node's built-in
// test runner). Requires Node >= 22.6 for native TypeScript type-stripping; the
// deploy pipeline (node:20 in Docker) only runs `astro build`, never these tests.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveTrail,
  normalizePath,
  humanizeSlug,
  SECTIONS,
} from "../src/lib/hierarchy.ts";

test("normalizePath strips trailing slash, query, and hash", () => {
  assert.equal(normalizePath("/work/"), "/work");
  assert.equal(normalizePath("/work?x=1"), "/work");
  assert.equal(normalizePath("/work#top"), "/work");
  assert.equal(normalizePath("/work/?x=1#top"), "/work");
  assert.equal(normalizePath(""), "/");
  assert.equal(normalizePath("/"), "/");
});

test("humanizeSlug title-cases hyphen/underscore slugs", () => {
  assert.equal(humanizeSlug("dod-platform-one"), "Dod Platform One");
  assert.equal(humanizeSlug("building_an_aibom"), "Building An Aibom");
  assert.equal(humanizeSlug("single"), "Single");
});

test("root path yields a single, current Home crumb", () => {
  const trail = resolveTrail("/");
  assert.equal(trail.length, 1);
  assert.deepEqual(trail[0], { label: "Home", path: "/", current: true });
});

test("section path yields Home -> Section with only the last current", () => {
  const trail = resolveTrail("/work");
  assert.deepEqual(
    trail.map((c) => [c.label, c.path, c.current]),
    [
      ["Home", "/", false],
      ["Work", "/work", true],
    ],
  );
});

test("trailing slash on a section path resolves identically", () => {
  assert.deepEqual(resolveTrail("/work/"), resolveTrail("/work"));
});

test("dynamic leaf uses the supplied label and appends under its parent", () => {
  const trail = resolveTrail("/work/dod-platform-one", "DoD Platform One");
  assert.deepEqual(
    trail.map((c) => [c.label, c.path, c.current]),
    [
      ["Home", "/", false],
      ["Work", "/work", false],
      ["DoD Platform One", "/work/dod-platform-one", true],
    ],
  );
});

test("dynamic leaf without a label falls back to a humanized slug", () => {
  const trail = resolveTrail("/writing/building-an-aibom");
  assert.equal(trail.at(-1)?.label, "Building An Aibom");
  assert.equal(trail.at(-1)?.current, true);
  assert.equal(trail[1].label, "Writing");
});

test("exactly one crumb is marked current", () => {
  for (const path of ["/", "/work", "/writing/foo", "/about"]) {
    const current = resolveTrail(path).filter((c) => c.current);
    assert.equal(current.length, 1, `expected one current crumb for ${path}`);
  }
});

test("unknown top-level path still yields Home + leaf context", () => {
  const trail = resolveTrail("/nowhere");
  assert.deepEqual(
    trail.map((c) => [c.label, c.current]),
    [
      ["Home", false],
      ["Nowhere", true],
    ],
  );
});

test("every registered section resolves to a trail ending at itself", () => {
  for (const node of Object.values(SECTIONS)) {
    const trail = resolveTrail(node.path);
    assert.equal(trail.at(-1)?.path, node.path);
    assert.equal(trail.at(-1)?.current, true);
    assert.equal(trail[0].path, "/", `${node.id} trail should start at root`);
  }
});
