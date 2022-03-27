/**
 * calculate distance in kilometers between two points specified by degrees of latitude and longitude
 *
 * @author @kawanet
 * @license MIT
 * @see https://gist.github.com/kawanet/15c5a260ca3b98bd080bb87cdae57230
 * @param {number} lat1 - degree of latitude of origin
 * @param {number} lng1 - degree of longitude of origin
 * @param {number} lat2 - degree of latitude of destination
 * @param {number} lng2 - degree of longitude of destination
 * @return {number} distance in kilometers between origin and destination
 */

export function distance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  lat1 *= Math.PI / 180;
  lng1 *= Math.PI / 180;
  lat2 *= Math.PI / 180;
  lng2 *= Math.PI / 180;
  return (
    6371 *
    Math.acos(
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) +
        Math.sin(lat1) * Math.sin(lat2),
    )
  );
}

/**
 * Calculate the sum of the distance of multiple positions
 * @param polyLine
 * @returns
 */
export const polylineDistance = (polyLine: { lat: number; lng: number }[]) => {
  let total = 0;
  for (let i = 1; i < polyLine.length; i++) {
    const { lat: lat1, lng: lng1 } = polyLine[i - 1];
    const { lat: lat2, lng: lng2 } = polyLine[i];
    total += distance(lat1, lng1, lat2, lng2);
  }
  return total;
};
