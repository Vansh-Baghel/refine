import { renderHook } from "@testing-library/react";

import { MockJSONServer, TestWrapper, mockRouterBindings } from "@test";

import { useApiUrl } from "./";

describe("useApiUrl Hook", () => {
  describe.each(["meta", "options"])(`should be called with %s`, (key) => {
    describe("when dataProvider is *not* provided", () => {
      describe("when resource is undefined", () => {
        it("returns default data provider", async () => {
          const { result } = renderHook(() => useApiUrl(), {
            wrapper: TestWrapper({
              dataProvider: MockJSONServer,
              resources: [
                { name: "posts" },
                {
                  name: "categories",
                  [key]: { dataProviderName: "categories" },
                },
              ],
            }),
          });

          expect(result.current).toBe("https://api.fake-rest.refine.dev");
        });
      });

      describe('when current resource has "dataProviderName" meta', () => {
        it("returns resource's dataProvider", async () => {
          const { result } = renderHook(() => useApiUrl(), {
            wrapper: TestWrapper({
              dataProvider: MockJSONServer,
              resources: [
                { name: "posts" },
                {
                  name: "categories",
                  [key]: { dataProviderName: "categories" },
                },
              ],
              routerProvider: mockRouterBindings({
                resource: {
                  name: "categories",
                  [key]: { dataProviderName: "categories" },
                },
              }),
            }),
          });

          expect(result.current).toBe(
            "https://categories.api.fake-rest.refine.dev",
          );
        });
      });

      describe('when current resource does *not* have "dataProviderName" meta', () => {
        it("returns default dataProvider", async () => {
          const { result } = renderHook(() => useApiUrl(), {
            wrapper: TestWrapper({
              dataProvider: MockJSONServer,
              resources: [
                {
                  name: "posts",
                },
                {
                  name: "categories",
                },
              ],
              routerProvider: mockRouterBindings({
                resource: {
                  name: "categories",
                },
              }),
            }),
          });

          expect(result.current).toBe("https://api.fake-rest.refine.dev");
        });
      });
    });

    describe("when dataProvider is provided", () => {
      it("returns provided data provider", async () => {
        const { result } = renderHook(() => useApiUrl("categories"), {
          wrapper: TestWrapper({
            dataProvider: MockJSONServer,
            resources: [{ name: "posts" }],
            routerProvider: mockRouterBindings({
              resource: {
                name: "posts",
                [key]: { dataProviderName: "posts" },
              },
            }),
          }),
        });

        expect(result.current).toBe(
          "https://categories.api.fake-rest.refine.dev",
        );
      });
    });
  });
});
