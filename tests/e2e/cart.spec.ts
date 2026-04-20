import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3001";

test.describe("Cart functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE);
    await page.evaluate(() => {
      localStorage.removeItem("paw-palace-cart");
      localStorage.removeItem("paw-palace-wishlist");
    });
  });

  // ─────────────────────────────────────────────
  // 1. Cart drawer opens/closes via header button
  // ─────────────────────────────────────────────
  test("cart button in header opens the cart drawer", async ({ page }) => {
    await page.goto(BASE);

    // Drawer should be off-screen initially
    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toHaveCSS("transform", /matrix.*1, 0, 0, 1/); // translate-x-full means it's hidden

    // Click cart button (desktop)
    await page.getByRole("button", { name: /shopping cart/i }).first().click();

    // Drawer should be visible now
    await expect(drawer).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
  });

  test("cart drawer closes with ESC key", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /shopping cart/i }).first().click();

    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    // Drawer slides out (translate-x-full applied)
    await expect(page.getByRole("heading", { name: "Your Cart" })).not.toBeInViewport();
  });

  test("cart drawer closes by clicking overlay", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /shopping cart/i }).first().click();

    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Click the overlay (left of drawer)
    await page.mouse.click(100, 300);
    await expect(page.getByRole("heading", { name: "Your Cart" })).not.toBeInViewport();
  });

  // ─────────────────────────────────────────────
  // 2. Add to cart from ProductShowcase (homepage)
  // ─────────────────────────────────────────────
  test("adds product to cart from homepage product showcase", async ({ page }) => {
    await page.goto(BASE);

    // Find first "Add" button in the product showcase
    const addBtn = page.getByRole("button", { name: /add .* to cart/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Cart drawer should open
    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Should show 1 item in cart
    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    // Badge in header should show 1 (aria-label updates to reflect count)
    const cartBtn = page.locator('[aria-label*="Shopping cart"]').first();
    await expect(cartBtn).toHaveAttribute("aria-label", /1 item/);

    // Subtotal should be visible
    await expect(page.getByText("Subtotal")).toBeVisible();
  });

  test("add button shows 'Added' feedback after click", async ({ page }) => {
    await page.goto(BASE);

    const addBtn = page.getByRole("button", { name: /add .* to cart/i }).first();
    await addBtn.click();

    // Button should briefly show "Added" state
    const addedBtn = page.getByRole("button", { name: /added/i }).first();
    await expect(addedBtn).toBeVisible();
  });

  // ─────────────────────────────────────────────
  // 3. Add to cart from product detail page
  // ─────────────────────────────────────────────
  test("adds product to cart from product detail page", async ({ page }) => {
    // Navigate to first product
    await page.goto(`${BASE}/products/premium-grain-free-salmon-kibble`);

    const addBtn = page.getByRole("button", { name: /add.*to cart/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Cart drawer should open
    await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
    await expect(page.getByText("Subtotal")).toBeVisible();

    // Button should change to "Added to Cart!"
    await expect(page.getByRole("button", { name: /added to cart/i }).first()).toBeVisible();
  });

  // ─────────────────────────────────────────────
  // 4. Cart quantity controls
  // ─────────────────────────────────────────────
  test("quantity can be increased and decreased in cart", async ({ page }) => {
    await page.goto(BASE);

    // Add a product
    await page.getByRole("button", { name: /add .* to cart/i }).first().click();

    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Initial quantity should be 1
    const qtyDisplay = drawer.locator("span.text-sm.font-semibold.w-6");
    await expect(qtyDisplay.first()).toHaveText("1");

    // Increase
    await drawer.getByRole("button", { name: "Increase quantity" }).click();
    await expect(qtyDisplay.first()).toHaveText("2");

    // Decrease
    await drawer.getByRole("button", { name: "Decrease quantity" }).click();
    await expect(qtyDisplay.first()).toHaveText("1");
  });

  test("removing item from cart when quantity reaches 0", async ({ page }) => {
    await page.goto(BASE);

    await page.getByRole("button", { name: /add .* to cart/i }).first().click();
    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Click decrease until item is removed
    await drawer.getByRole("button", { name: "Decrease quantity" }).click();

    // Cart should now be empty
    await expect(drawer.getByText("Your cart is empty")).toBeVisible();
  });

  test("remove button deletes item from cart", async ({ page }) => {
    await page.goto(BASE);

    await page.getByRole("button", { name: /add .* to cart/i }).first().click();
    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Click trash icon
    const removeBtn = drawer.getByRole("button", { name: /remove/i }).first();
    await removeBtn.click();

    await expect(drawer.getByText("Your cart is empty")).toBeVisible();
  });

  test("clear cart button removes all items", async ({ page }) => {
    await page.goto(BASE);

    // Add two different products
    const addBtns = page.getByRole("button", { name: /add .* to cart/i });
    await addBtns.nth(0).click();
    // Close drawer to add second
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    await addBtns.nth(1).click();

    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    await drawer.getByRole("button", { name: "Clear cart" }).click();
    await expect(drawer.getByText("Your cart is empty")).toBeVisible();
  });

  // ─────────────────────────────────────────────
  // 5. Free shipping progress bar
  // ─────────────────────────────────────────────
  test("free shipping progress bar appears when items in cart", async ({ page }) => {
    await page.goto(BASE);

    await page.getByRole("button", { name: /add .* to cart/i }).first().click();
    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Should show either progress bar or free shipping message
    const hasProgress = await drawer.getByText(/more for free shipping/i).isVisible().catch(() => false);
    const hasFreeMsg = await drawer.getByText(/qualify for free shipping/i).isVisible().catch(() => false);
    expect(hasProgress || hasFreeMsg).toBeTruthy();
  });

  // ─────────────────────────────────────────────
  // 6. Cart persists across page navigation
  // ─────────────────────────────────────────────
  test("cart items persist across page navigation", async ({ page }) => {
    await page.goto(BASE);

    await page.getByRole("button", { name: /add .* to cart/i }).first().click();
    await page.keyboard.press("Escape");
    // Wait for localStorage to be written
    await page.waitForFunction(() =>
      localStorage.getItem("paw-palace-cart") !== null &&
      JSON.parse(localStorage.getItem("paw-palace-cart")!).length > 0
    );

    // Navigate to a product page
    await page.goto(`${BASE}/products/premium-grain-free-salmon-kibble`);

    // Wait for the cart badge to reflect loaded items (proves localStorage was read)
    await expect(page.locator('[aria-label*="Shopping cart"]').first()).toHaveAttribute(
      "aria-label",
      /1 item/,
      { timeout: 10000 }
    );

    // Open cart
    await page.getByRole("button", { name: /shopping cart/i }).first().click();
    const drawer = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(drawer).toBeVisible();

    // Item should still be there
    await expect(drawer.getByText("Subtotal")).toBeVisible();
    await expect(drawer.getByText("Your cart is empty")).not.toBeVisible();
  });

  // ─────────────────────────────────────────────
  // 7. 404 page
  // ─────────────────────────────────────────────
  test("custom 404 page is shown for unknown routes", async ({ page }) => {
    await page.goto(`${BASE}/this-page-does-not-exist`);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByRole("link", { name: /go home/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────
  // 8. Login/Account button
  // ─────────────────────────────────────────────
  test("account dropdown shows Sign in and Create account when logged out", async ({ page }) => {
    await page.goto(BASE);

    // Click the account icon button
    await page.getByRole("button", { name: /account/i }).click();

    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create account/i })).toBeVisible();
  });

  test("sign in link navigates to login page", async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole("button", { name: /account/i }).click();
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
