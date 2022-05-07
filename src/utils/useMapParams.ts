import { LatLngLiteral } from 'leaflet';
import { useLocation } from 'react-router-dom';
import { overlayLayers } from './layerList';
/**
 * ・Querystring definition
 *   ・lat,lngは緯度、経度(浮動小数)
 * 　・overlay
 *     query=lat,lng
 *     zoom=1～18
 *     map=[0,1,2,3,4,5]   ・・・baseLayersの選択Index
 *     overlay0   ・・・存在すれば「赤色立体地図」をオーバーレイ表示
 *     overlay1   ・・・存在すれば「地質図」をオーバーレイ表示
 *     overlay2   ・・・存在すれば「地すべり地形分布図'」をオーバーレイ表示
 *
 * ・例
 *   query=36.05340134559295,138.05334091186526&map=2&zoom=14&overlay2
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

  const overlay = overlayLayers.map((v, i) => query.has(`overlay${i}`));
  queryVal = { ...queryVal, overlay };

  return {
    zoom: 14,
    mapIndex: 0,
    overlay: [],
    ...queryVal,
  };
};

export default useMapParams;
