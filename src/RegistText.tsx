import { VFC, useState, useEffect } from 'react';
import { LatLng, LatLngLiteral, Marker as LeafletMarker } from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { setLocationState } from './utils/altitude';

type propType = {
  location: LatLngLiteral;
  setLocation: setLocationState;
};

type LatLngText = LatLngLiteral & { text: string };

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコンを表示する
 *   ・クリックした位置を、親コンポーネント(App)へ通知する(state)し、その位置にMarkerを表示する
 */
const LocationMarker: VFC<propType> = ({ location, setLocation }) => {
  const [markers, setMarkers] = useState<LatLngText[]>([]);
  useMapEvents({
    click: (e) => {
      setLocation(e.latlng);
      setMarkers((ary) => {
        let newAry;
        if (ary.length > 0 && ary.slice(-1)[0].text) {
          newAry = [...ary, { ...e.latlng, text: '' }];
        } else {
          newAry = [...ary.slice(0, ary.length - 1), { ...e.latlng, text: '' }];
        }
        localStorage.setItem('Markers', JSON.stringify(newAry));
        return newAry;
      });
    },
  });

  useEffect(() => {
    const markers = localStorage.getItem('Markers');
    if (markers) setMarkers(JSON.parse(markers));
  }, []);

  const setText = (marker: LatLngLiteral, text: string) => {
    const index = markers.findIndex(
      (item) => item.lat === marker.lat && item.lng === marker.lng,
    );

    if (index >= 0) {
      setMarkers((ary) => {
        const cpy = ary.slice();
        cpy.splice(index, 1, { ...ary[index], text });
        localStorage.setItem('Markers', JSON.stringify(cpy));
        return cpy;
      });
    }
  };

  return (
    <>
      {markers.map((marker) => (
        <Marker position={marker} key={marker.lat}>
          <Popup>
            {`lat:${marker.lat.toFixed(5)} lng:${marker.lng.toFixed(5)}`}
            <br />
            <input
              type="text"
              value={marker.text}
              onChange={(e) => {
                setText(marker, e.target.value);
              }}
            ></input>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default LocationMarker;
