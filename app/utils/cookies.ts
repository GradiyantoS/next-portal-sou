// src/utils/cookies.ts
export function setCookie(name: string, value: string, days?: number) {
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/`;
  if (days && days > 0) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    cookie += `; Expires=${expires}`;
  }
  document.cookie = cookie;
}

export function getCookie(name: string): string {
  const found = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split('=')[1]) : '';
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
}
