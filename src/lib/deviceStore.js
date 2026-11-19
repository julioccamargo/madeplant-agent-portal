const KEY = "madeplant_selected_device";

export function getSelectedDeviceId() {
  return sessionStorage.getItem(KEY) || "";
}

export function setSelectedDeviceId(id) {
  if (id) sessionStorage.setItem(KEY, id);
}