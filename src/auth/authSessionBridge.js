/**
 * Lets the Axios client refresh or clear the session without importing AuthProvider
 * (avoids circular dependencies).
 */

let refreshSessionFn = async () => false;
let clearSessionFn = () => {};

export const registerAuthSessionHandlers = ({ refresh, clear }) => {
  if (typeof refresh === "function") refreshSessionFn = refresh;
  if (typeof clear === "function") clearSessionFn = clear;
};

export const tryRefreshSession = () => refreshSessionFn();

export const clearAuthSession = () => clearSessionFn();
