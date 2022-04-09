import { VFC, useEffect, useState, useRef, useMemo } from 'react';
import { LatLngLiteral, Marker as MarkerRef, Popup as PopupRef } from 'leaflet';
import { Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import ReactTooltip from 'react-tooltip';
import { BsRulers } from 'react-icons/bs';
import { setLocationState } from './utils/altitude';
import { polylineDistance } from './utils/distance';
import { iconSize } from './utils/const';

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
 * ・Drag&Dropすると移動した間に線を引くとともに、Popupで距離を表示する
 * ・連続してDrag&Dropした場合、折れ線を表示し、合計距離を表示する
 *   ・stateが空配列の場合、開始地点と終了地点を追加する
 *   ・終了地点はdragイベント中に、移動先の値で更新する(PolyLineコントロールが線を表示する)
 *   ・開始地点が前回の最後の位置と同じ場合、連続したDrag&Dropと判断し、終点を追加する
 */
const GPS: VFC<propType> = ({
  location,
  setLocation,
  measureMode,
  setMeasureMode,
}) => {
  const [polyline, setPolyline] = useState<LatLngLiteral[]>([]);
  const markerRef = useRef<MarkerRef>(null);
  const popRef = useRef<PopupRef>(null);
  const map = useMap();

  const dragEndTime = useRef<number>(0);

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

  const onClearClick = () => {
    const marker = markerRef.current as MarkerRef;
    setPolyline([marker.getLatLng()]);
  };

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
      if (measureMode && new Date().getTime() - dragEndTime.current > 10) {
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
          <ReactTooltip type="success" place="right" />
        </div>
      </Control>
      {measureMode && (
        <>
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={location}
            ref={markerRef}
          >
            <Popup className="measure-popup" ref={popRef}>
              {polylineDistance(polyline).toFixed(3) + 'km'}

              <div className="measure-clear" onClick={() => onClearClick()}>
                クリア
              </div>
            </Popup>
          </Marker>
          <Polyline positions={polyline} color="green" />
        </>
      )}
    </>
  );
};

export default GPS;
