const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'upea_token';

/**
 * Store authentication token in localStorage
 */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

/**
 * Retrieve authentication token from localStorage
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

/**
 * Check if user has a stored token
 */
export const hasToken = (): boolean => {
  return getToken() !== null;
};

/**
 * Store user data in localStorage
 */
export const setUser = (user: unknown): void => {
  try {
    localStorage.setItem('upea_user', JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user:', error);
  }
};

/**
 * Retrieve user data from localStorage
 */
export const getUser = <T = unknown>(): T | null => {
  try {
    const userStr = localStorage.getItem('upea_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to retrieve user:', error);
    return null;
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  try {
    localStorage.removeItem('upea_user');
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

