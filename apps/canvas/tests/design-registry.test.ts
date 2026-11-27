import { describe, expect, it } from "vitest";
import { buildDesignRegistry } from "@yami/prototypes/design";
import { resolvePrototypeVariant } from "../app/lib/prototype-projects";

describe("design project discovery", () => {
  it("infers titles and IDs from nested paths and respects inherited visibility", () => {
    const { prototypeProjects } = buildDesignRegistry({
      "./Mobile/Checkout.stories.tsx": {
        default: { tags: ["!dev"] },
        Internal: {},
        FirstDraft: { tags: ["dev"], name: "Checkout V1" },
      },
      "./Hidden.stories.ts": { default: {}, Draft: { tags: ["!dev"] } },
    });
    expect(prototypeProjects).toHaveLength(1);
    expect(prototypeProjects[0]).toMatchObject({
      id: "mobile-checkout", name: "Checkout",
      variants: [{ id: "first-draft", name: "Checkout V1", storyId: "yami-design-mobile-checkout--first-draft" }],
    });
  });

  it("isolates conflicting URLs and identifies all their sources", () => {
    const shared = { parameters: { project: { id: "copied" } } };
    const duplicate = { args: { id: "draft" } };
    const { prototypeProjects, designIssues } = buildDesignRegistry({
      "./One.stories.ts": { default: shared, One: {} },
      "./Two.stories.ts": { default: shared, Two: {} },
      "./Three.stories.ts": { default: {}, One: duplicate, Two: duplicate, Public: {} },
    });
    expect(prototypeProjects.map(({ id, variants }) => [id, variants.map((item) => item.id)])).toEqual([["three", ["public"]]]);
    expect(designIssues).toContainEqual(expect.stringMatching(/draft.*Three\.stories\.ts#One.*Three\.stories\.ts#Two/));
    expect(designIssues).toContainEqual(expect.stringMatching(/copied.*One\.stories\.ts.*Two\.stories\.ts/));
  });

  it("blocks globally duplicated Story IDs, including hidden stories, without dropping unique variants", () => {
    const fixed = { parameters: { __id: "shared--draft" } };
    const { prototypeProjects, designIssues } = buildDesignRegistry({
      "./A.stories.ts": { default: {}, Draft: fixed, Other: {} },
      "./B.stories.ts": { default: {}, Candidate: fixed, Internal: { ...fixed, tags: ["!dev"] } },
    });
    expect(designIssues).toContainEqual(expect.stringMatching(/shared--draft.*A\.stories\.ts#Draft.*B\.stories\.ts#Candidate.*B\.stories\.ts#Internal/));
    expect(prototypeProjects.map(p => [p.id, p.variants.map(v => v.id)])).toEqual([["a", ["other"]]]);
  });

  it("rejects inferred and explicit reserved variant IDs only in Global Navigation", () => {
    const variants = { Current: {}, Menu: { args: { id: "image-categories" } }, H5V1: { args: { id: "h5-v1" } } };
    const { prototypeProjects, designIssues } = buildDesignRegistry({
      "./global-navigation.stories.ts": { default: {}, ...variants },
      "./Other.stories.ts": { default: {}, ...variants },
    });
    const [navigation, other] = prototypeProjects;
    expect(navigation.variants.map(v => v.id)).toEqual(["h5-v1"]);
    expect(designIssues).toContainEqual(expect.stringMatching(/current.*global-navigation\.stories\.ts#Current/));
    expect(designIssues).toContainEqual(expect.stringMatching(/image-categories.*global-navigation\.stories\.ts#Menu/));
    for (const id of ["current", "image-categories"]) {
      expect(resolvePrototypeVariant(navigation, id)?.id).toBe("h5-v1");
      expect(resolvePrototypeVariant(other, id)?.id).toBe(id);
    }
  });

  it("recognizes hidden custom IDs and removed variants of known design components without the remote index", () => {
    const { isDesignStoryId } = buildDesignRegistry({
      "./Hidden.stories.ts": { default: { id: "custom-group", tags: ["!dev"] }, Draft: { parameters: { __id: "private-preview" } } },
    });
    for (const id of ["private-preview", "custom-group--old", "yami-design-deleted--old"]) expect(isDesignStoryId(id)).toBe(true);
    expect(isDesignStoryId("yami-pages-cart--mobile")).toBe(false);
  });

  it("keeps historical aliases bound to V1 when variants are added or removed", () => {
    const files = { "./global-navigation.stories.ts": { default: {}, AppDraft: {}, H5V1: { args: { id: "h5-v1" } } } };
    const [project] = buildDesignRegistry(files).prototypeProjects;
    for (const id of ["current", "image-categories"]) {
      expect(resolvePrototypeVariant(project, id)?.id).toBe("h5-v1");
      expect(resolvePrototypeVariant({ ...project, variants: project.variants.slice(0, 1) }, id)).toBeUndefined();
    }
    expect(buildDesignRegistry({})).toMatchObject({ prototypeProjects: [], designIssues: [] });
  });
});
