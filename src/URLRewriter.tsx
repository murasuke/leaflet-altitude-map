import { VFC, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LatLngLiteral } from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';
import { baseLayers, overlayLayers } from './utils/layerList';
import { MapParam } from './utils/useMapParams';

type Params = MapParam & { location: LatLngLiteral };

/**
 * 画面の状態をURLに反映するためのコンポーネント
 * ・「戻る、進む」 ができるようになる
 * ・「ブックマーク」で現在位置、表示設定を保存、復元できる
 * ・URLをコピペして他の人に伝える(位置と設定)ことができる
 */
const URLRewriter: VFC<Params> = (param) => {
  const makeQuery = (alt?: LatLngLiteral, map?: MapParam) => {
    if (!alt || !map) {
      return '';
    }
    let query = `?query=${alt.lat},${alt.lng}&map=${map.mapIndex}&zoom=${map.zoom}`;
    map.overlay.forEach((val, idx) => {
      query += val ? `&overlay${idx}` : '';
    });
    return query;
  };

  const [mapState, setMapState] = useState<MapParam>({ ...param });
  const map = useMap();
  const navigate = useNavigate();

  useEffect(() => {
    const query = makeQuery(param.location, mapState);
    // 戻る場合URLの履歴に追加しない
    if (query !== window.history.state.usr) {
      navigate(query, { state: query });
    } else {
      // 戻る場合はURLに指定された位置へ移動する
      map.flyTo(param.location);
    }
  }, [
    param.location.lat,
    param.location.lng,
    mapState.zoom,
    mapState.overlay,
    mapState.mapIndex,
  ]);

  // Leafletのイベントを捕捉して、Stateへ反映する
  useMapEvents({
    baselayerchange: (e) => {
      const mapIndex = baseLayers.findIndex((value) => value.name === e.name);
      setMapState((prev) => {
        return { ...prev, mapIndex };
      });
    },
    overlayadd: (e) => {
      const idx = overlayLayers.findIndex((value) => value.name === e.name);
      const overlay = mapState.overlay.slice();
      overlay[idx] = true;
      setMapState((prev) => {
        return { ...prev, overlay };
      });
    },
    overlayremove: (e) => {
      const idx = overlayLayers.findIndex((value) => value.name === e.name);
      const overlay = mapState.overlay.slice();
      overlay[idx] = false;
      setMapState((prev) => {
        return { ...prev, overlay };
      });
    },
    zoomend: (e) => {
      const zoom = map.getZoom();
      setMapState((prev) => {
        return { ...prev, zoom };
      });
    },
  });

  return null;
};

export default URLRewriter;
