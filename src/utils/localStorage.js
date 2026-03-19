export function setLocalStorage(name, value) {
  try {
    localStorage.setItem(name, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

export function getLocalStorage(name) {
  try {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Error reading from localStorage:", e);
    return null;
  }
}

export function removeLocalStorage(name) {
  try {
    localStorage.removeItem(name);
  } catch (e) {
    console.error("Error removing from localStorage:", e);
  }
}
