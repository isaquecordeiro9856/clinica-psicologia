import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Gestão inteligente');
    await expect(page.locator('text=ClínicaPsi')).toBeVisible();
  });

  test('should have login and register links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Agenda inteligente')).toBeVisible();
    await expect(page.locator('text=Prontuário seguro')).toBeVisible();
    await expect(page.locator('text=PIX e cartão')).toBeVisible();
    await expect(page.locator('text=LGPD nativo')).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Entrar');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-destructive')).toBeVisible({ timeout: 10000 });
  });

  test('should login successfully as psychologist', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'psi@clinica.app');
    await page.fill('input[type="password"]', 'Senha123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/psicologa\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Register Page', () => {
  test('should display register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Criar conta');
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="lgpd"]')).toBeVisible();
  });

  test('should have LGPD consent checkbox', async ({ page }) => {
    await page.goto('/register');
    const checkbox = page.locator('input[id="lgpd"]');
    await expect(checkbox).not.toBeChecked();
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });
});
