import { VFC, useRef } from 'react';
import { Marker as MarkerRef, Popup as PopupRef, LatLngLiteral } from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { setLocationState } from './utils/altitude';

type propType = {
  location: LatLngLiteral;
  setLocation: setLocationState;
};

const gmap = 'https://www.google.com/maps/search/?api=1&query=';

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコンを表示する
 *   ・クリックした位置を、親コンポーネント(App)へ通知する(state)し、その位置にMarkerを表示する

 */
const LocationMarker: VFC<propType> = ({ location, setLocation }) => {
  const markerRef = useRef<MarkerRef>(null);
  const popRef = useRef<PopupRef>(null);

  const dragEndTime = useRef<number>(0);

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
      <Marker draggable={true} position={location} ref={markerRef}>
        <Popup ref={popRef}>
          <a href={`${gmap}${location.lat},${location.lng}`} target="blank">
            googleマップで開く
          </a>
        </Popup>
      </Marker>
    </>
  );
};

export default LocationMarker;
