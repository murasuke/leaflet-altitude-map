import { VFC, useState, useRef, useEffect } from 'react';
import { Popup as PopupRef, Marker as MarkerRef } from 'leaflet';
import { useMap, Polyline, Marker, Popup } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BsRecordCircle } from 'react-icons/bs';
import NoSleep from 'nosleep.js';
import { distance, polylineDistance } from './utils/distance';

const PositionTracer: VFC = () => {
  const iconSize = '30px';
  const [locationLog, setLocationLog] = useState<[number, number][]>([]);
  const [recording, setRecording] = useState(false);
  const noSleepRef = useRef<NoSleep>(new NoSleep());
  const map = useMap();
  const timerId = useRef<NodeJS.Timer | number>(null!);

  const markerRef = useRef<MarkerRef>(null);
  const popRef = useRef<PopupRef>(null);

  // 位置を保存する関数(データ量削減のため、前回からの移動距離が5m未満の場合は追加しない)
  const recordPosition = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      setLocationLog((ary) => {
        if (ary.length > 0) {
          const [lastLat, lastLng] = ary.slice(-1)[0];
          if (distance(lastLat, lastLng, latitude, longitude) < 5 / 1000) {
            // 移動距離が5m未満の場合追加しない
            return ary;
          }
        }
        map.flyTo([latitude, longitude]);
        if (ary.length > 1) {
          popRef.current?.openOn(map);
        }
        return [...ary, [latitude, longitude]];
      });
    });
  };

  // タイマーで位置を保存
  const onclick = () => {
    if (!recording) {
      recordPosition();
      markerRef.current?.setOpacity(1);
      timerId.current = setInterval(recordPosition, 3000);
      noSleepRef.current.enable();
    } else {
      clearInterval(timerId.current as NodeJS.Timer);
      markerRef.current?.setOpacity(0);
      timerId.current = 0;
      noSleepRef.current.disable();
    }
    setRecording(!recording);
  };

  useEffect(() => {
    // アイコンの色を変更するためclass追加(App.cssに下記のスタイルを追加する)
    // .tracer-marker { filter: hue-rotate(120deg) }
    markerRef.current?.getElement()?.classList.add('tracer-marker');
    markerRef.current?.setOpacity(0);
  }, []);

  return (
    <>
      <Control
        position="topleft"
        style={{ backgroundColor: '#FFF', height: iconSize }}
      >
        <BsRecordCircle
          color={timerId.current ? 'red' : 'black'}
          size={iconSize}
          onClick={() => onclick()}
        />
      </Control>

      <Polyline color="red" positions={locationLog} />

      <Marker
        position={locationLog.length ? locationLog.slice(-1)[0] : [0, 0]}
        ref={markerRef}
      >
        <Popup ref={popRef}>
          {polylineDistance(
            locationLog.map((item) => {
              return { lat: item[0], lng: item[1] };
            }),
          ).toFixed(3) + 'km'}
        </Popup>
      </Marker>
    </>
  );
};

export default PositionTracer;
