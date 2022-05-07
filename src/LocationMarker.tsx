import { VFC } from 'react';
import { LatLngLiteral } from 'leaflet';
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
 *   ・クリックした位置を、親コンポーネント(App)へ通知。その位置にMarkerを表示する
 */
const LocationMarker: VFC<propType> = ({ location, setLocation }) => {
  useMapEvents({
    click: (e) => {
      setLocation(e.latlng);
    },
  });

  return !location ? null : (
    <>
      <Marker draggable={true} position={location}>
        <Popup>
          <a href={`${gmap}${location.lat},${location.lng}`} target="blank">
            googleマップで開く
          </a>
        </Popup>
      </Marker>
    </>
  );
};

export default LocationMarker;
