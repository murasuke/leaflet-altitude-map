import { VFC, useState } from 'react';
import { LatLng } from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import 'utils/initLeaflet';
import { getAltitude, AltitudeDetail } from 'utils/altitude';
import 'leaflet/dist/leaflet.css';
import './App.css';

const f = (num: number, fixed = 7) =>
  ('             ' + num.toFixed(fixed)).slice(-6 - fixed);
const formatAlt = (alt: AltitudeDetail) =>
  `標高:${f(alt.h ?? 0, alt.fixed)}m\n緯度:${f(alt.pos.lat)}\n経度:${f(
    alt.pos.lng,
  )}`;

const AltitudeArea: VFC<{ altitude?: AltitudeDetail }> = ({ altitude }) => {
  return (
    <div className={'leaflet-top leaflet-right'}>
      <div
        className="leaflet-control leaflet-bar"
        style={{ width: '200px', backgroundColor: 'Lavender' }}
      >
        <pre className="coords">{altitude ? formatAlt(altitude) : ''}</pre>
      </div>
    </div>
  );
};

const LocationMarker: VFC<{
  altitude?: AltitudeDetail;
  setAltitude: React.Dispatch<React.SetStateAction<AltitudeDetail | undefined>>;
}> = ({ setAltitude, altitude }) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      const { lat, lng } = e.latlng;
      getAltitude(lat, lng, (alt, altDetail) => {
        console.log(alt + 'm');
        setAltitude(altDetail);
      });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>{`Alt(${(altitude?.h ?? 0).toFixed(1) + 'm'}) ${position}`}</Popup>
    </Marker>
  );
};

const MapAltitude: VFC = () => {
  const [altitude, setAltitude] = useState<AltitudeDetail>();

  return (
    <MapContainer center={{ lat: 35.3607411, lng: 138.727262 }} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
      />
      <LocationMarker altitude={altitude} setAltitude={setAltitude} />
      <AltitudeArea altitude={altitude} />
    </MapContainer>
  );
};

export default MapAltitude;
