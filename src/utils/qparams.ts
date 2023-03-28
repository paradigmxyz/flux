export function getQueryParam(parameterName: string) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(parameterName);
}

export function resetURL() {
  history.replaceState({}, document.title, window.location.pathname);
}
