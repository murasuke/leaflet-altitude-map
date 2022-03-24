import { VFC, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import {
  getAltitude,
  AltitudeDetail,
  setAltState,
  Position,
} from './utils/altitude';
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
  const [position, setPosition] = useState(pos);
  const [polyline, setPolyline] = useState<Position[]>([pos]);

  const markerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const popRef = useRef<any>(null);
  const map = useMap();

  const eventHandlers = useMemo(
    () => ({
      dragstart: () => {
        const marker = markerRef.current;
        marker.setOpacity(0.6);
        setPolyline([marker.getLatLng()]);
      },
      dragend() {
        const marker = markerRef.current;
        marker.setOpacity(1);
        if (marker != null) {
          setPosition(marker.getLatLng());
          popRef.current.openOn(map);
        }
      },
      drag() {
        const marker = markerRef.current;
        setPolyline((ary) => {
          return [ary[0], marker.getLatLng()];
        });
      },
    }),
    [],
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
  }, [pos, callback]);

  return position === null ? null : (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      >
        <Popup ref={popRef}>
          {polyline.length > 1
            ? `${distance(
                polyline[0].lat,
                polyline[0].lng,
                polyline[1].lat,
                polyline[1].lng,
              ).toFixed(5)} km`
            : ''}
        </Popup>
      </Marker>
      {polyline ? <Polyline positions={polyline} ref={lineRef} /> : null}
    </>
  );
};

export default LocationMarker;
