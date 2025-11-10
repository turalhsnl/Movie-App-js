const SESSION_COOKIE = "metamask-auth";

const isBrowser = () => typeof document !== "undefined";

const cookieString = (value, options = {}) => {
  const parts = [`${SESSION_COOKIE}=${value}`];
  const { path = "/", sameSite = "Lax", maxAge, expires } = options;

  if (path) {
    parts.push(`Path=${path}`);
  }

  if (sameSite) {
    parts.push(`SameSite=${sameSite}`);
  }

  if (typeof maxAge === "number") {
    parts.push(`Max-Age=${maxAge}`);
  }

  if (expires instanceof Date) {
    parts.push(`Expires=${expires.toUTCString()}`);
  }

  return parts.join("; ");
};

export const markSessionAuthenticated = () => {
  if (!isBrowser()) return;
  document.cookie = cookieString("1");
};

export const clearSessionCookie = () => {
  if (!isBrowser()) return;
  const epoch = new Date(0);
  document.cookie = cookieString("", { expires: epoch });
};

export const hasSessionCookie = () => {
  if (!isBrowser()) return false;
  return document.cookie.split(";").some(part => part.trim().startsWith(`${SESSION_COOKIE}=`));
};

export { SESSION_COOKIE };
