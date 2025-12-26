export function setAuth(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function logout() {
  localStorage.clear();
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}
