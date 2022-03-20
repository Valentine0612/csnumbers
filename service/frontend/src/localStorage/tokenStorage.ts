export function setTokenStorage(token: string) {
    localStorage.setItem("token", token);
}

export function getTokenStorage() {
    return localStorage.getItem("token");
}

export function deleteTokenStorage() {
    localStorage.removeItem("token");
}
