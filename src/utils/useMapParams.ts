import { LatLngLiteral } from 'leaflet';
import { useLocation } from 'react-router-dom';
/**
 * ・url querystring definition
 *   query=lat,lng
 *   zoom=
 *   map=[1,2,3,4,5,6]
 *   overlay1
 *   overlay2
 *   overlay3
 *  const param = useMapParam();
 */

export type MapParam = {
  center?: LatLngLiteral;
  zoom: number;
  mapIndex: number;
  overlay: boolean[];
};

const useMapParams = (): MapParam => {
  const urlLocation = useLocation();
  const query = new URLSearchParams(urlLocation.search);
  let queryVal = {};
  if (query.has('query')) {
    const latlng = query.get('query')?.split(',');
    if (latlng && latlng.length === 2) {
      const [lat, lng] = [parseFloat(latlng[0]), parseFloat(latlng[1])];
      if (lat && lng) {
        queryVal = { ...queryVal, center: { lat, lng } };
      }
    }
  }

  const zoom = query.has('zoom') && parseInt(query.get('zoom') ?? '14');
  if (zoom) {
    queryVal = { ...queryVal, zoom };
  }

  const mapIndex = query.has('map') && parseInt(query.get('map') ?? '0');
  if (mapIndex) {
    queryVal = { ...queryVal, mapIndex };
  }

  const overlay: boolean[] = [];
  [...Array(10).keys()].forEach((i) => {
    if (query.has(`overlay${i}`)) {
      overlay.push(true);
    }
  });
  queryVal = { ...queryVal, overlay };

  console.log(queryVal);

  return {
    zoom: 14,
    mapIndex: 0,
    overlay: [],
    ...queryVal,
  };
};

export default useMapParams;
