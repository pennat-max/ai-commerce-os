import { test, expect } from "@playwright/test";

test.describe("login flow", () => {
  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "AI Commerce OS" })).toBeVisible();
    await expect(page.getByLabel("อีเมล")).toBeVisible();
    await expect(page.getByRole("button", { name: "เข้าสู่ระบบ" })).toBeVisible();
  });

  test("logs in with env credentials", async ({ page }) => {
    const email = process.env.E2E_LOGIN_EMAIL ?? "owner@example.com";
    const password = process.env.E2E_LOGIN_PASSWORD ?? "CommerceOS2026!";

    await page.goto("/login");
    await page.getByLabel("อีเมล").fill(email);
    await page.getByLabel("รหัสผ่าน").fill(password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page).toHaveURL(/\/app/, { timeout: 30000 });
    await expect(page.getByText("ภาพรวมร้านค้า")).toBeVisible();
  });
});
