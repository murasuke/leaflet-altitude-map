import { VFC, useEffect, useState, useRef } from 'react';
import { LatLngLiteral, Marker as MarkerRef, Popup as PopupRef } from 'leaflet';
import { Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import ReactTooltip from 'react-tooltip';
import { BsRulers } from 'react-icons/bs';
import { setLocationState } from './utils/altitude';
import { polylineDistance } from './utils/distance';

export type setMeasureModeState = React.Dispatch<React.SetStateAction<boolean>>;

type propType = {
  location: LatLngLiteral;
  setLocation: setLocationState;
  measureMode: boolean;
  setMeasureMode: setMeasureModeState;
};

/**
 * 定規アイコン
 * ・クリックした位置の距離を算出する
 */
const GPS: VFC<propType> = ({
  location,
  setLocation,
  measureMode,
  setMeasureMode,
}) => {
  const [polyline, setPolyline] = useState<LatLngLiteral[]>([]);
  const iconSize = '30px';
  const markerRef = useRef<MarkerRef>(null);
  const popRef = useRef<PopupRef>(null);
  const map = useMap();

  useEffect(() => {
    // アイコンの色を変更するためclass追加(App.cssに下記のスタイルを追加する)
    // .measure-marker { filter: hue-rotate(240deg) }
    markerRef.current?.getElement()?.classList.add('measure-marker');
  }, [measureMode]);

  // 計測モードを切り替える
  const onclick = () => {
    const newMode = !measureMode;
    setMeasureMode(() => newMode);

    if (newMode) {
      setPolyline([location]);
    }
  };

  useMapEvents({
    click: (e) => {
      if (measureMode) {
        const { lat, lng } = e.latlng;
        setLocation(e.latlng);
        setPolyline((ary) => [...ary, { lat, lng }]);
        popRef.current?.openOn(map);
      }
    },
  });

  return (
    <>
      <Control
        position="topleft"
        style={{ backgroundColor: '#FFF', height: iconSize }}
      >
        <div data-tip={measureMode ? '計測中' : '距離計測'}>
          <BsRulers
            color={measureMode ? 'green' : 'black'}
            size={iconSize}
            onClick={() => onclick()}
          />
          <ReactTooltip type="info" place="right" />
        </div>
      </Control>
      {measureMode && (
        <>
          <Marker position={location} ref={markerRef}>
            <Popup ref={popRef}>
              {polylineDistance(polyline).toFixed(3) + 'km'}
            </Popup>
          </Marker>
          <Polyline positions={polyline} color="green" />
        </>
      )}
    </>
  );
};

export default GPS;
