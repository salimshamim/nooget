/**
 * Array of routes which are accessible to the public
 *
 * @type {string[]}
 */
export const publicRoutes = ["/auth/new-verification"];

/**
 * Array of routes which are used for authentication purpose
 * These routes will redirect the logged in user to a default redirect page
 * @type {string[]}
 */
export const authRoutes: string[] = ["/auth/login"];

export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/views";
export const DEFAULT_ADMIN_REDIRECT = "/admin/dashboard";

