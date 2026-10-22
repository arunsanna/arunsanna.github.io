// Unit tests for the JSON-LD @graph builders. See hierarchy.test.ts for the
// Node-version note.
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTrail } from "../src/lib/hierarchy.ts";
import {
  buildGraph,
  buildArticle,
  buildCreativeWork,
  absoluteUrl,
  personId,
  websiteId,
  serializeJsonLd,
  type GraphNode,
  type PersonInput,
} from "../src/lib/structured-data.ts";

const SITE_URL = "https://arunsanna.com";
const person: PersonInput = {
  name: "Arun Sanna",
  jobTitle: "Enterprise AI Architect",
  url: SITE_URL,
  email: "arun@example.com",
  sameAs: ["https://github.com/arunsanna"],
  knowsAbout: ["AI Security"],
  alumniOf: "CSULA",
};

const nodesByType = (graph: GraphNode): Record<string, GraphNode> => {
  const out: Record<string, GraphNode> = {};
  for (const n of graph["@graph"] as GraphNode[]) {
    // The page node carries a schema.org subtype as its @type
    // (WebPage/CollectionPage/ItemPage/…); key it under "WebPage" so callers can
    // assert on it regardless of subtype. Every other node keys by its @type.
    const id = n["@id"];
    const key =
      typeof id === "string" && id.endsWith("#webpage")
        ? "WebPage"
        : (n["@type"] as string);
    out[key] = n;
  }
  return out;
};

test("absoluteUrl handles root, absolute, and bare paths; trims double slashes", () => {
  assert.equal(absoluteUrl(SITE_URL, "/"), "https://arunsanna.com/");
  assert.equal(absoluteUrl(SITE_URL, "/work"), "https://arunsanna.com/work");
  assert.equal(absoluteUrl(SITE_URL, "work"), "https://arunsanna.com/work");
  assert.equal(
    absoluteUrl(`${SITE_URL}/`, "/work"),
    "https://arunsanna.com/work",
  );
});

test("id helpers are stable and slash-trimmed", () => {
  assert.equal(personId(SITE_URL), "https://arunsanna.com/#person");
  assert.equal(personId(`${SITE_URL}/`), "https://arunsanna.com/#person");
  assert.equal(websiteId(SITE_URL), "https://arunsanna.com/#website");
});

test("home graph: WebSite + Person + WebPage, no BreadcrumbList, Person is mainEntity", () => {
  const graph = buildGraph({
    siteUrl: SITE_URL,
    pageUrl: "https://arunsanna.com/",
    title: "Arun Sanna",
    description: "desc",
    trail: resolveTrail("/"),
    personIsMainEntity: true,
    person,
  });
  const byType = nodesByType(graph);
  assert.ok(byType.WebSite && byType.Person && byType.WebPage);
  assert.equal(
    byType.BreadcrumbList,
    undefined,
    "home should have no breadcrumb",
  );
  assert.equal(byType.WebPage.breadcrumb as GraphNode | undefined, undefined);
  assert.deepEqual(byType.WebPage.mainEntity, { "@id": personId(SITE_URL) });
  assert.deepEqual(byType.WebPage.about, { "@id": personId(SITE_URL) });
  assert.deepEqual(byType.WebPage.isPartOf, { "@id": websiteId(SITE_URL) });
});

test("section graph: includes a BreadcrumbList with ordered, absolute items", () => {
  const pageUrl = "https://arunsanna.com/work";
  const graph = buildGraph({
    siteUrl: SITE_URL,
    pageUrl,
    title: "Work",
    description: "desc",
    trail: resolveTrail("/work"),
    pageType: "CollectionPage",
    person,
  });
  const byType = nodesByType(graph);
  assert.equal(byType.WebPage["@type"], "CollectionPage");
  assert.deepEqual(byType.WebPage.breadcrumb, {
    "@id": `${pageUrl}#breadcrumb`,
  });

  const items = byType.BreadcrumbList.itemListElement as GraphNode[];
  assert.equal(items.length, 2);
  assert.deepEqual(
    items.map((i) => [i.position, i.name, i.item]),
    [
      [1, "Home", "https://arunsanna.com/"],
      [2, "Work", "https://arunsanna.com/work"],
    ],
  );
});

test("detail graph: primary entity is added and referenced as mainEntity", () => {
  const pageUrl = "https://arunsanna.com/work/dod-platform-one";
  const work = buildCreativeWork(SITE_URL, {
    url: pageUrl,
    title: "DoD Platform One",
    description: "case study",
    keywords: ["Federal", "Kubernetes"],
  });
  const graph = buildGraph({
    siteUrl: SITE_URL,
    pageUrl,
    title: "DoD Platform One — Arun Sanna",
    description: "case study",
    trail: resolveTrail("/work/dod-platform-one", "DoD Platform One"),
    pageType: "ItemPage",
    primaryEntity: work,
    person,
  });
  const byType = nodesByType(graph);
  assert.ok(byType.CreativeWork, "primary entity present in graph");
  assert.deepEqual(byType.WebPage.mainEntity, { "@id": `${pageUrl}#work` });
  assert.equal(
    byType.CreativeWork.creator &&
      (byType.CreativeWork.creator as GraphNode)["@id"],
    personId(SITE_URL),
  );
  assert.deepEqual(byType.CreativeWork.keywords, ["Federal", "Kubernetes"]);
  assert.equal(
    (byType.BreadcrumbList.itemListElement as GraphNode[]).length,
    3,
  );
});

test("buildArticle is a BlogPosting authored + published by the Person", () => {
  const article = buildArticle(SITE_URL, {
    url: "https://arunsanna.com/writing/x",
    title: "X",
    description: "d",
    datePublished: "2026-01-01",
  });
  assert.equal(article["@type"], "BlogPosting");
  assert.equal(article.datePublished, "2026-01-01");
  assert.deepEqual(article.author, { "@id": personId(SITE_URL) });
  assert.deepEqual(article.publisher, { "@id": personId(SITE_URL) });
  assert.equal(
    "keywords" in article,
    false,
    "no keywords key when none supplied",
  );
});

test("every graph node carries a unique @id", () => {
  const graph = buildGraph({
    siteUrl: SITE_URL,
    pageUrl: "https://arunsanna.com/work/x",
    title: "X",
    description: "d",
    trail: resolveTrail("/work/x", "X"),
    primaryEntity: buildCreativeWork(SITE_URL, {
      url: "https://arunsanna.com/work/x",
      title: "X",
      description: "d",
    }),
    person,
  });
  const ids = (graph["@graph"] as GraphNode[]).map((n) => n["@id"]);
  assert.equal(new Set(ids).size, ids.length, "all @id values are unique");
});

test("serializeJsonLd escapes characters that could break out of <script>", () => {
  const out = serializeJsonLd({ description: "</script><b>&" });
  assert.equal(out.includes("</script>"), false);
  assert.equal(out.includes("<"), false);
  assert.equal(out.includes(">"), false);
  assert.equal(out.includes("&"), false);
  // round-trips back to the original value once parsed
  assert.equal(JSON.parse(out).description, "</script><b>&");
});
