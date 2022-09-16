export const parseCookies = (request) => {
  const parsed = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return parsed;

  cookieHeader.split(`;`).forEach((cookie) => {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;

    const value = rest.join(`=`).trim();
    if (!value) return;
    parsed[name] = decodeURIComponent(value);
  });

  return parsed;
};
