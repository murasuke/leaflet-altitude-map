import { VFC, useState, useRef, useMemo } from 'react';
import { Marker as MarkerRef, Popup as PopupRef, LatLngLiteral } from 'leaflet';
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
  const [polyline, setPolyline] = useState<LatLngLiteral[]>([location]);

  const markerRef = useRef<MarkerRef>(null);
  const popRef = useRef<PopupRef>(null);
  const map = useMap();

  const dragEndTime = useRef<number>(0);

  const eventHandlers = useMemo(
    () => ({
      dragstart: () => {
        const marker = markerRef.current as MarkerRef;
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
        const marker = markerRef.current as MarkerRef;
        marker.setOpacity(1);
        popRef.current?.openOn(map);
        setLocation(marker.getLatLng());
        dragEndTime.current = new Date().getTime();
      },
      drag: () => {
        const marker = markerRef.current as MarkerRef;
        popRef.current?.openOn(map);
        setPolyline((ary) =>
          ary.length === 1
            ? [...ary, marker.getLatLng()]
            : [...ary.slice(0, ary.length - 1), marker.getLatLng()],
        );
      },
    }),
    [map, setLocation],
  );

  useMapEvents({
    click: (e) => {
      // dragend後にclickイベントが意図せず発生する場合がある(Markerの位置がずれる)
      // 10ms以内に発生した場合は無視する
      if (new Date().getTime() - dragEndTime.current > 10) {
        setLocation(e.latlng);
      }
    },
  });

  return !location ? null : (
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
