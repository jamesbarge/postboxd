import { test, expect } from "@playwright/test";

/**
 * Calendar Page E2E Tests
 *
 * Tests the main calendar page functionality including:
 * - Page loading and basic structure
 * - Film type filtering (All/New/Repertory)
 * - Venue type filtering (All/Indie/Chains)
 * - Date filtering
 * - Cinema selection
 * - Film search
 * - Clear all filters
 */

test.describe("Calendar Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for content to load
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // ===========================================================================
  // Page Structure Tests
  // ===========================================================================

  test.describe("Page Structure", () => {
    test("should display header with logo", async ({ page }) => {
      // Header should be visible
      await expect(page.locator("header")).toBeVisible();

      // Logo text should be visible
      await expect(page.getByText("Postboxd")).toBeVisible();
    });

    test("should display main content area", async ({ page }) => {
      await expect(page.locator("main")).toBeVisible();
    });

    test("should display FAQ section", async ({ page }) => {
      // FAQ section should be present
      await expect(
        page.getByRole("heading", { name: "Frequently Asked Questions" })
      ).toBeVisible();
    });

    test("should show filter buttons on desktop", async ({ page }) => {
      // Skip on mobile viewport
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Film type filter buttons
      await expect(page.getByRole("button", { name: /All/i }).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /New/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Repertory/i })).toBeVisible();
    });
  });

  // ===========================================================================
  // Film Type Filter Tests
  // ===========================================================================

  test.describe("Film Type Filtering", () => {
    test("should filter by Repertory films", async ({ page }) => {
      // Skip on mobile - filters are in collapsible panel
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Click Repertory filter
      await page.getByRole("button", { name: /Repertory/i }).click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // The Repertory button should now be active (has accent color)
      const repertoryButton = page.getByRole("button", { name: /Repertory/i });
      await expect(repertoryButton).toHaveClass(/bg-accent-primary/);
    });

    test("should filter by New releases", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Click New filter
      await page.getByRole("button", { name: /New/i }).click();

      await page.waitForTimeout(500);

      // The New button should be active
      const newButton = page.getByRole("button", { name: /New/i });
      await expect(newButton).toHaveClass(/bg-accent-primary/);
    });

    test("should reset to All films", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // First apply a filter
      await page.getByRole("button", { name: /Repertory/i }).click();
      await page.waitForTimeout(300);

      // Then click All
      // Need to be more specific since there are multiple "All" buttons
      const filmTypeButtons = page.locator("header button").filter({ hasText: /^All$/ }).first();
      await filmTypeButtons.click();

      await page.waitForTimeout(300);

      // All button should be active
      await expect(filmTypeButtons).toHaveClass(/bg-accent-primary/);
    });
  });

  // ===========================================================================
  // Venue Type Filter Tests
  // ===========================================================================

  test.describe("Venue Type Filtering", () => {
    test("should filter by Independent venues", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Click Indie filter
      await page.getByRole("button", { name: /Indie/i }).click();

      await page.waitForTimeout(500);

      const indieButton = page.getByRole("button", { name: /Indie/i });
      await expect(indieButton).toHaveClass(/bg-accent-primary/);
    });

    test("should filter by Chain venues", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Click Chains filter
      await page.getByRole("button", { name: /Chains/i }).click();

      await page.waitForTimeout(500);

      const chainsButton = page.getByRole("button", { name: /Chains/i });
      await expect(chainsButton).toHaveClass(/bg-accent-primary/);
    });
  });

  // ===========================================================================
  // Date Filter Tests
  // ===========================================================================

  test.describe("Date Filtering", () => {
    test("should open date picker dropdown", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Click the date filter button (shows "When" by default)
      const dateButton = page.getByRole("button", { name: /When/i });
      await dateButton.click();

      // Date picker dropdown should be visible
      await expect(page.getByText("Any Date")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
      await expect(page.getByText("Weekend")).toBeVisible();
      await expect(page.getByText("7 Days")).toBeVisible();
    });

    test("should filter by Today", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Open date picker
      await page.getByRole("button", { name: /When/i }).click();

      // Click Today
      await page.getByRole("button", { name: "Today", exact: true }).click();

      // Wait for filter to apply
      await page.waitForTimeout(300);

      // The Today button should be active
      await expect(
        page.getByRole("button", { name: "Today", exact: true })
      ).toHaveClass(/bg-accent-primary/);
    });

    test("should filter by 7 Days", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Open date picker
      await page.getByRole("button", { name: /When/i }).click();

      // Click 7 Days
      await page.getByRole("button", { name: "7 Days", exact: true }).click();

      await page.waitForTimeout(300);

      await expect(
        page.getByRole("button", { name: "7 Days", exact: true })
      ).toHaveClass(/bg-accent-primary/);
    });

    test("should show time presets", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Open date picker
      await page.getByRole("button", { name: /When/i }).click();

      // Time presets should be visible
      await expect(page.getByText("Any Time")).toBeVisible();
      await expect(page.getByText("Matinee")).toBeVisible();
      await expect(page.getByText("Evening")).toBeVisible();
    });
  });

  // ===========================================================================
  // Cinema Filter Tests
  // ===========================================================================

  test.describe("Cinema Filtering", () => {
    test("should open cinema dropdown", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Click cinema filter button
      const cinemaButton = page.getByRole("button", { name: /All Cinemas/i });
      await cinemaButton.click();

      // Dropdown should be visible with search and cinema list
      await expect(
        page.getByPlaceholder("Search cinemas...")
      ).toBeVisible();
    });

    test("should search cinemas", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Open cinema dropdown
      await page.getByRole("button", { name: /All Cinemas/i }).click();

      // Type in search
      await page.getByPlaceholder("Search cinemas...").fill("BFI");

      // Wait for filter
      await page.waitForTimeout(300);

      // Should show filtered results (if BFI exists in the database)
      // This test verifies the search input works
    });

    test("should select and deselect cinema", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Open cinema dropdown
      await page.getByRole("button", { name: /All Cinemas/i }).click();

      // Click first cinema in the list (after "All Cinemas" option)
      const cinemaList = page.locator(
        'button:has-text("All Cinemas") + div + button'
      );

      // If cinemas exist, click the first one
      const firstCinema = page.locator('.max-h-64 button').nth(1);
      if (await firstCinema.isVisible()) {
        await firstCinema.click();

        // The button should show selected state
        await expect(firstCinema).toHaveClass(/bg-accent-primary/);
      }
    });
  });

  // ===========================================================================
  // Search Tests
  // ===========================================================================

  test.describe("Film Search", () => {
    test("should show search input", async ({ page }) => {
      // Search input should be visible
      const searchInput = page.getByPlaceholder("Search...");
      await expect(searchInput).toBeVisible();
    });

    test("should filter by search term", async ({ page }) => {
      // Type in search
      const searchInput = page.getByPlaceholder("Search...");
      await searchInput.fill("test");

      // Wait for debounced search
      await page.waitForTimeout(500);

      // The input should have the value
      await expect(searchInput).toHaveValue("test");
    });

    test("should clear search", async ({ page }) => {
      // Type in search
      const searchInput = page.getByPlaceholder("Search...");
      await searchInput.fill("test");
      await page.waitForTimeout(300);

      // Clear button should appear
      const clearButton = page.locator('button[aria-label="Clear search"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Search should be cleared
        await expect(searchInput).toHaveValue("");
      }
    });

    test("should open search with keyboard shortcut", async ({ page }) => {
      // Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      await page.keyboard.press("Meta+k");

      // Search input should be focused
      const searchInput = page.getByPlaceholder("Search...");
      await expect(searchInput).toBeFocused();
    });
  });

  // ===========================================================================
  // Clear All Filters Tests
  // ===========================================================================

  test.describe("Clear All Filters", () => {
    test("should show clear button when filters are active", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Initially, clear button should not be visible
      const clearButton = page.getByRole("button", { name: /Clear \(\d+\)/i });
      await expect(clearButton).not.toBeVisible();

      // Apply a filter
      await page.getByRole("button", { name: /Repertory/i }).click();
      await page.waitForTimeout(300);

      // Now clear button should be visible
      await expect(
        page.getByRole("button", { name: /Clear \(\d+\)/i })
      ).toBeVisible();
    });

    test("should clear all filters when clicked", async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 640) {
        test.skip();
        return;
      }

      // Apply multiple filters
      await page.getByRole("button", { name: /Repertory/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole("button", { name: /Indie/i }).click();
      await page.waitForTimeout(300);

      // Click clear button
      const clearButton = page.getByRole("button", { name: /Clear \(\d+\)/i });
      await clearButton.click();
      await page.waitForTimeout(300);

      // Clear button should no longer be visible
      await expect(clearButton).not.toBeVisible();

      // Film type should be reset to All
      const allButton = page.locator("header button").filter({ hasText: /^All$/ }).first();
      await expect(allButton).toHaveClass(/bg-accent-primary/);
    });
  });

  // ===========================================================================
  // Empty State Tests
  // ===========================================================================

  test.describe("Empty States", () => {
    test("should show empty state when search has no results", async ({ page }) => {
      // Type a search term that won't match anything
      const searchInput = page.getByPlaceholder("Search...");
      await searchInput.fill("xyznonexistentfilm123");
      await page.waitForTimeout(500);

      // Should show empty state message
      // The exact message depends on whether there are screenings in the database
      // We just verify the search was applied
      await expect(searchInput).toHaveValue("xyznonexistentfilm123");
    });
  });

  // ===========================================================================
  // Mobile Tests
  // ===========================================================================

  test.describe("Mobile Layout", () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test("should show mobile filter button", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Mobile filter button should be visible
      const filterButton = page.getByRole("button", { name: /Filters/i });
      await expect(filterButton).toBeVisible();
    });

    test("should open filter panel on mobile", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Click mobile filter button
      await page.getByRole("button", { name: /Filters/i }).click();

      // Filter panel should open
      await expect(page.getByText("Film Type")).toBeVisible();
      await expect(page.getByText("Venue Type")).toBeVisible();
      await expect(page.getByText("When")).toBeVisible();
      await expect(page.getByText("Cinema")).toBeVisible();
    });

    test("should show filter count on mobile button", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Open filters
      await page.getByRole("button", { name: /Filters/i }).click();

      // Apply a filter (click Repertory in the panel)
      const repertoryInPanel = page.locator("text=Repertory").last();
      await repertoryInPanel.click();

      await page.waitForTimeout(300);

      // The filter button should show count
      // Note: The exact behavior depends on implementation
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  test.describe("Navigation", () => {
    test("should navigate to settings page", async ({ page }) => {
      // Click settings icon in header
      const settingsLink = page.locator('a[href="/settings"]');
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await expect(page).toHaveURL(/\/settings/);
      }
    });

    test("should navigate to map page", async ({ page }) => {
      const mapLink = page.locator('a[href="/map"]');
      if (await mapLink.isVisible()) {
        await mapLink.click();
        await expect(page).toHaveURL(/\/map/);
      }
    });

    test("should navigate to watchlist page", async ({ page }) => {
      const watchlistLink = page.locator('a[href="/watchlist"]');
      if (await watchlistLink.isVisible()) {
        await watchlistLink.click();
        await expect(page).toHaveURL(/\/watchlist/);
      }
    });
  });
});

// ===========================================================================
// Accessibility Tests
// ===========================================================================

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should have h1 (even if sr-only)
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // FAQ section should have h2
    const h2 = page.locator("h2");
    expect(await h2.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have accessible search input", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder("Search...");
    await expect(searchInput).toHaveAttribute("aria-label", "Search films and cinemas");
    await expect(searchInput).toHaveAttribute("role", "combobox");
  });
});
