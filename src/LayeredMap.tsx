import { FC, useState, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
  LayerGroup,
  Circle,
  FeatureGroup,
  Rectangle,
} from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { AltitudeDetail } from './utils/altitude';

type propType = {
  center: LatLngExpression;
  zoom?: number;
};

const LayeredMap: FC<propType> = ({ center, children, zoom = 14 }) => {
  return (
    <MapContainer center={center} zoom={zoom}>
      <Control position="topright">
        <LayersControl>
          <LayersControl.BaseLayer checked name="国土地理院(標準地図)">
            <TileLayer
              attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="国土地理院(白地図)">
            <TileLayer
              attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="国土地理院(写真:最新)">
            <TileLayer
              attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="国土地理院(写真:1987年～1990年)">
            <TileLayer
              attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/gazo4/{z}/{x}/{y}.jpg"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="国土地理院(写真:1974年～1978年)">
            <TileLayer
              attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap.Mapnik">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay name="赤色立体地図">
            <TileLayer
              attribution='&copy; <a href="https://www.rrim.jp/">アジア航測株式会社の赤色立体地図作成手法（特許3670274、特許4272146）を使用</a>'
              url="https://cyberjapandata.gsi.go.jp/xyz/sekishoku/{z}/{x}/{y}.png"
              opacity={0.5}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="地質図">
            <TileLayer
              attribution='&copy; <a href="https://gbank.gsj.jp/seamless/v2/api/1.2/">産総研地質調査総合センター</a>'
              url="https://gbank.gsj.jp/seamless/v2/api/1.2/tiles/{z}/{y}/{x}.png"
              opacity={0.5}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="地すべり地形分布図">
            <TileLayer
              attribution='&copy; <a href="https://www.j-shis.bosai.go.jp/landslidemap">防災科研</a>'
              url="https://jmapweb3v.bosai.go.jp/map/xyz/landslide/{z}/{x}/{y}.png"
              opacity={0.5}
            />
          </LayersControl.Overlay>
        </LayersControl>
      </Control>

      {children}
    </MapContainer>
  );
};

export default LayeredMap;
