export function setItemInStorage(key: string, value: string): void {
  window.localStorage.setItem(key, value);
}

export function removeItemInStorage(key: string): void {
  window.localStorage.removeItem(key);
}

export function getItemFromStorage(key: string): string | null {
  return window.localStorage.getItem(key);
}
