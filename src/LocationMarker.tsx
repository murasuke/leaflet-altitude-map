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
 * ・クリックした位置にアイコンを表示する
 *   ・クリックした位置を、親コンポーネント(App)へ通知する(state)し、その位置にMarkerを表示する
 * ・Drag&Dropすると移動した間に線を引くとともに、Popupで距離を表示する
 * ・連続してDrag&Dropした場合、折れ線を表示し、合計距離を表示する
 *   ・stateが空配列の場合、開始地点と終了地点を追加する
 *   ・終了地点はdragイベント中に、移動先の値で更新する(PolyLineコントロールが線を表示する)
 *   ・開始地点が前回の最後の位置と同じ場合、連続したDrag&Dropと判断し、終点を追加する
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
              // 前回の終了位置が、今回の開始位置と同じ場合、終了位置を追加(折れ線追加)
              return [...ary, marker.getLatLng()];
            }
          }
          // 開始位置、終了位置を開始位置で初期化
          return [marker.getLatLng(), marker.getLatLng()];
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
        // 終了位置を更新
        setPolyline((ary) => [
          ...ary.slice(0, ary.length - 1),
          marker.getLatLng(),
        ]);
      },
    }),
    [map, setLocation],
  );

  useMapEvents({
    click: (e) => {
      // dragend後に意図せずclickイベントが発生する場合がある(Markerの位置がずれる)
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
