import React from "react";
import { RefineThemedLayoutV2SiderProps } from "@refinedev/ui-types";

import { act, mockRouterBindings, render, TestWrapper, waitFor } from "@test";
import { AuthProvider, LegacyAuthProvider } from "@refinedev/core";
import { Route, Router, Routes } from "react-router-dom";

const mockLegacyAuthProvider: LegacyAuthProvider & { isProvided: boolean } = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(["admin"]),
  getUserIdentity: () => Promise.resolve(),
  isProvided: true,
};

const mockAuthProvider: AuthProvider = {
  check: () => Promise.resolve({ authenticated: true }),
  login: () => Promise.resolve({ success: true }),
  logout: () => Promise.resolve({ success: true }),
  getPermissions: () => Promise.resolve(["admin"]),
  onError: () => Promise.resolve({}),
};

export const layoutSiderTests = function (
  SiderElement: React.ComponentType<RefineThemedLayoutV2SiderProps>,
): void {
  describe("[@refinedev/ui-tests] Common Tests / Sider Element", () => {
    it("should render successful", async () => {
      const { container } = render(<SiderElement />, {
        wrapper: TestWrapper({}),
      });

      expect(container).toBeTruthy();
    });

    it("should render logout menu item successful", async () => {
      const { getAllByText } = render(<SiderElement />, {
        wrapper: TestWrapper({
          legacyAuthProvider: mockLegacyAuthProvider,
        }),
      });

      await waitFor(() =>
        expect(getAllByText("Posts").length).toBeGreaterThanOrEqual(1),
      );
      expect(getAllByText("Logout").length).toBeGreaterThanOrEqual(1);
    });

    it("should work menu item click", async () => {
      const { getAllByText } = render(<SiderElement />, {
        wrapper: TestWrapper({
          legacyAuthProvider: mockLegacyAuthProvider,
        }),
      });

      await waitFor(() => getAllByText("Posts")[0].click());
      await waitFor(() => expect(window.location.pathname).toBe("/posts"));
    });

    // NOTE : Will be removed in v5
    it("should work legacy logout menu item click", async () => {
      const logoutMockedAuthProvider = {
        ...mockLegacyAuthProvider,
        logout: jest.fn().mockImplementation(() => Promise.resolve()),
      };
      const { getAllByText } = render(<SiderElement />, {
        wrapper: TestWrapper({
          legacyAuthProvider: logoutMockedAuthProvider,
        }),
      });

      await act(async () => {
        getAllByText("Logout")[0].click();
      });

      expect(logoutMockedAuthProvider.logout).toBeCalledTimes(1);
    });

    it("should work logout menu item click", async () => {
      const logoutMockedAuthProvider = {
        ...mockAuthProvider,
        logout: jest
          .fn()
          .mockImplementation(() => Promise.resolve({ success: true })),
      };
      const { getAllByText } = render(<SiderElement />, {
        wrapper: TestWrapper({
          authProvider: logoutMockedAuthProvider,
        }),
      });

      await act(async () => {
        getAllByText("Logout")[0].click();
      });

      expect(logoutMockedAuthProvider.logout).toBeCalledTimes(1);
    });

    it("should render only allowed menu items", async () => {
      const { getAllByText, queryByText } = render(<SiderElement />, {
        wrapper: TestWrapper({
          resources: [
            {
              name: "posts",
              list: function render() {
                return <div>posts</div>;
              },
            },
            {
              name: "users",
              list: function render() {
                return <div>users</div>;
              },
            },
          ],
          accessControlProvider: {
            can: ({ action, resource }) => {
              if (action === "list" && resource === "posts") {
                return Promise.resolve({ can: true });
              }
              if (action === "list" && resource === "users") {
                return Promise.resolve({ can: false });
              }
              return Promise.resolve({ can: false });
            },
          },
        }),
      });

      await waitFor(() => getAllByText("Posts")[0]);
      await waitFor(() => expect(queryByText("Users")).toBeNull());
    });

    it("should render custom element passed with render prop", async () => {
      const { getAllByText, queryAllByText } = render(
        <SiderElement
          render={({ logout, dashboard, items }) => {
            return (
              <>
                <div>custom-element</div>
                {dashboard}
                {items}
                {logout}
              </>
            );
          }}
        />,
        {
          wrapper: TestWrapper({
            legacyAuthProvider: mockLegacyAuthProvider,
            DashboardPage: function Dashboard() {
              return <div>Dashboard</div>;
            },
          }),
        },
      );

      await waitFor(() =>
        expect(getAllByText("Posts").length).toBeGreaterThanOrEqual(1),
      );
      expect(queryAllByText("Logout").length).toBeGreaterThanOrEqual(1);
      expect(queryAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
      expect(queryAllByText("custom-element").length).toBeGreaterThanOrEqual(1);
    });

    it("should item disabled when activeItemDisabled:true (legacyRouterProvider)", async () => {
      const { getAllByText, getAllByRole } = render(
        <SiderElement activeItemDisabled={true} />,
        {
          wrapper: TestWrapper({
            routerInitialEntries: ["/posts"],
            resources: [
              {
                name: "posts",
                list: "/posts",
              },
            ],
          }),
        },
      );

      await waitFor(() => {
        return expect(getAllByText("Posts").length).toBeGreaterThanOrEqual(1);
      });

      await waitFor(() => {
        const allLinks = getAllByRole("link");
        const postLink = allLinks.find((link) => {
          return link.getAttribute("href") === "/posts";
        });
        return expect(postLink).toHaveStyle("pointer-events: none");
      });
    });

    it("should item disabled when activeItemDisabled:true", async () => {
      const { getAllByText, getAllByRole } = render(
        <SiderElement activeItemDisabled={true} />,
        {
          wrapper: TestWrapper({
            routerInitialEntries: ["/posts"],
            routerProvider: mockRouterBindings({
              pathname: "/posts",
              action: "list",
              resource: {
                name: "posts",
                list: "/posts",
              },
            }),
            resources: [
              {
                name: "posts",
                list: "/posts",
              },
              {
                name: "users",
                list: "/users",
              },
            ],
          }),
        },
      );

      await waitFor(() => {
        return expect(getAllByText("Posts").length).toBeGreaterThanOrEqual(1);
      });

      await waitFor(() => {
        const allLinks = getAllByRole("link");
        const postLink = allLinks.find((link) => {
          return link.getAttribute("href") === "/posts";
        });

        return expect(postLink).toHaveStyle("pointer-events: none");
      });
    });
  });
};
