import { VFC, useCallback, useState, useRef, useMemo } from 'react';
import { Marker as LeafletMarker, LatLngLiteral } from 'leaflet';
import { Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { setLocationState } from './utils/altitude';
import { polylineDistance } from './utils/distance';

type propType = {
  location: LatLngLiteral;
  setLocation: setLocationState;
};

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコン表示する
 * ・位置から標高を取得し、位置表示エリアに引き渡す(state経由)
 * ・親から渡された位置が変わった場合、標高を再取得する
 */
const LocationMarker: VFC<propType> = ({ location, setLocation }) => {
  const setLocationCB = useCallback((e) => setLocation(e), [setLocation]);
  const [polyline, setPolyline] = useState<LatLngLiteral[]>([location]);

  const markerRef = useRef<any>(null);
  const popRef = useRef<any>(null);
  const map = useMap();

  const eventHandlers = useMemo(
    () => ({
      dragstart: () => {
        const marker = markerRef.current as LeafletMarker;
        marker.setOpacity(0.6);

        const { lat, lng } = marker.getLatLng();
        setPolyline((ary) => {
          if (ary.length >= 1) {
            const last = ary.slice(-1)[0];
            if (last.lat === lat && last.lng === lng) {
              return [...ary, marker.getLatLng()];
            }
          }
          return [marker.getLatLng()];
        });
      },
      dragend: () => {
        const marker = markerRef.current as LeafletMarker;
        marker.setOpacity(1);
        popRef.current.openOn(map);
        setLocationCB(marker.getLatLng());
      },
      drag: () => {
        const marker = markerRef.current as LeafletMarker;
        popRef.current.openOn(map);
        setPolyline((ary) =>
          ary.length === 1
            ? [...ary, marker.getLatLng()]
            : [...ary.slice(0, ary.length - 1), marker.getLatLng()],
        );
      },
    }),
    [map, setLocationCB],
  );

  useMapEvents({
    click: (e) => {
      setLocation(e.latlng);
    },
  });

  return location === null ? null : (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={location}
        ref={markerRef}
      >
        <Popup ref={popRef}>
          {polylineDistance(polyline).toFixed(3) + 'km'}
        </Popup>
      </Marker>
      {polyline ? <Polyline positions={polyline} /> : null}
    </>
  );
};

export default LocationMarker;
