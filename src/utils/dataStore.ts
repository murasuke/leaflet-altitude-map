const markerKey = 'ALTITUDE-MAP-MARKER-KEY';

export const storePopup = (json: string) => {
  localStorage.setItem(markerKey, json);
};

export const loadPopup = () => {
  const markers = localStorage.getItem(markerKey);
  return markers;
};
