import { VFC, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LatLngLiteral } from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';
import { baseLayers, overlayLayers } from './utils/layerList';
import { MapParam } from './utils/useMapParams';

type Params = MapParam & { location: LatLngLiteral };

/**
 * 画面の状態をURLに反映する(ブックマーク)
 */
const URLRewriter: VFC<Params> = (param) => {
  const makeQuery = (alt?: LatLngLiteral, map?: MapParam) => {
    if (!alt || !map) {
      return '';
    }
    let query = `?query=${alt.lat},${alt.lng}&map=${map.mapIndex}&zoom=${map.zoom}`;
    map.overlay?.forEach((val, idx) => {
      query += val ? `&overlay${idx}` : '';
    });
    return query;
  };

  const [mapState, setMapState] = useState<MapParam>({ ...param });
  const map = useMap();
  const navi = useNavigate();

  const rewriteUrl = useCallback(() => {
    const query = makeQuery(param.location, mapState);
    // window.history.pushState(null, '', query);
    navi(query);
  }, [param.location, mapState]);

  useMapEvents({
    baselayerchange: (e) => {
      const mapIndex = baseLayers.findIndex((value) => value.name === e.name);
      setMapState((prev) => {
        return { ...prev, mapIndex };
      });
    },
    overlayadd: (e) => {
      const idx = overlayLayers.findIndex((value) => value.name === e.name);
      let overlay = mapState.overlay?.slice() ?? [false, false, false];
      overlay[idx] = true;
      setMapState((prev) => {
        return { ...prev, overlay };
      });
    },
    overlayremove: (e) => {
      const idx = overlayLayers.findIndex((value) => value.name === e.name);
      let overlay = mapState.overlay?.slice() ?? [false, false, false];
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

  useEffect(() => {
    rewriteUrl();
  }, [param.location, mapState, rewriteUrl]);

  useEffect(() => {
    window.addEventListener('popstate', (e) => {
      navi(-1);
    });
  });

  return null;
};

export default URLRewriter;
