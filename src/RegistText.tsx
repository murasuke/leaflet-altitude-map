import { VFC, useState, useEffect } from 'react';
import { LatLng, LatLngLiteral, Marker as LeafletMarker } from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { setLocationState } from './utils/altitude';
import { loadPopup, storePopup } from './utils/dataStore';

type propType = {
  location: LatLngLiteral;
  setLocation: setLocationState;
};

type LatLngText = LatLngLiteral & { text: string };
const gmap = 'https://www.google.com/maps/search/?api=1&query=';

/**
 * 任意の位置にメモを残すマーカー（実験的機能)
 */
const LocationMarker: VFC<propType> = ({ location, setLocation }) => {
  const [markers, setMarkers] = useState<LatLngText[]>([]);
  useEffect(() => {
    const markers = loadPopup();
    if (markers) setMarkers(JSON.parse(markers));
  }, []);

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
        storePopup(JSON.stringify(newAry));
        return newAry;
      });
    },
  });

  const setText = (marker: LatLngLiteral, text: string) => {
    const index = markers.findIndex(
      (item) => item.lat === marker.lat && item.lng === marker.lng,
    );

    if (index >= 0) {
      setMarkers((ary) => {
        const cpy = ary.slice();
        cpy.splice(index, 1, { ...ary[index], text });
        storePopup(JSON.stringify(cpy));
        return cpy;
      });
    }
  };

  const delPopup = (marker: LatLngLiteral) => {
    const index = markers.findIndex(
      (item) => item.lat === marker.lat && item.lng === marker.lng,
    );

    if (index >= 0) {
      setMarkers((ary) => {
        const cpy = ary.slice();
        cpy.splice(index, 1);
        storePopup(JSON.stringify(cpy));
        return cpy;
      });
    }
  };

  return (
    <>
      {markers.map((marker) => (
        <Marker position={marker} key={marker.lat}>
          <Popup>
            <a href={`${gmap}${marker.lat},${marker.lng}`} target="blank">
              {`(${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)})`}
            </a>
            <br />
            <textarea
              value={marker.text}
              onChange={(e) => {
                setText(marker, e.target.value);
              }}
            ></textarea>
            <div className="both-end-box">
              <button className="popup-button" onClick={() => delPopup(marker)}>
                削除
              </button>
              {/* <button className="popup-button">更新</button> */}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default LocationMarker;
