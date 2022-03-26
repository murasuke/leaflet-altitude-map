import { VFC, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Marker as LeafletMarker, LatLngLiteral } from 'leaflet';
import { Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { getAltitude, AltitudeDetail, setAltState } from './utils/altitude';
import { distance } from './utils/distance';

type propType = {
  altitude: AltitudeDetail;
  setAltitude: setAltState;
};

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコン表示する
 * ・位置から標高を取得し、位置表示エリアに引き渡す(state経由)
 * ・親から渡された位置が変わった場合、標高を再取得する
 */
const LocationMarker: VFC<propType> = ({ altitude, setAltitude }) => {
  const { pos } = altitude;
  const callback = useCallback((e) => setAltitude(e), [setAltitude]);
  const [position, setPosition] = useState<LatLngLiteral>(pos);
  const [polyline, setPolyline] = useState<LatLngLiteral[]>([pos]);

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
      dragend() {
        const marker = markerRef.current as LeafletMarker;
        marker.setOpacity(1);
        popRef.current.openOn(map);
      },
      drag() {
        const marker = markerRef.current as LeafletMarker;
        popRef.current.openOn(map);
        setPolyline((ary) =>
          ary.length === 1
            ? [...ary, marker.getLatLng()]
            : [...ary.slice(0, ary.length - 1), marker.getLatLng()],
        );
      },
    }),
    [map],
  );

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // クリックされた位置の標高を取得
      getAltitude(lat, lng, (alt, altDetail) => {
        console.log(`標高:${alt}m`);
        console.log(`緯度:${pos.lat} 経度:${pos.lng}`);
        if (altDetail) {
          setAltitude(altDetail);
        }
      });
    },
  });

  // 親から渡された位置が変わった場合、標高を再取得
  useEffect(() => {
    setPosition(pos);
    getAltitude(pos.lat, pos.lng, (alt, altDetail) => {
      if (altDetail) {
        callback(altDetail);
      }
    });
  }, [pos.lat, pos.lng, callback]);

  const polylineDistance = (polyLine: LatLngLiteral[]) => {
    let total = 0;
    for (let i = 1; i < polyLine.length; i++) {
      const { lat: lat1, lng: lng1 } = polyLine[i - 1];
      const { lat: lat2, lng: lng2 } = polyLine[i];
      total += distance(lat1, lng1, lat2, lng2);
    }
    return total;
  };

  return position === null ? null : (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
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
