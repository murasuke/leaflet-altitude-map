# 標高表示機能付きマップ(国土地理院)

## 初めに

地図を表示したときに、クリックした場所の標高が知りたいと思いませんか？
国土地理院では、全国の標高マップと、その使い方を公開していましたのでReact-leafletを使い
クリックした場所の位置と標高を表示するプログラムを作成しました。

[標高を求めるプログラム](https://maps.gsi.go.jp/development/elevation.html)
[標高タイルの詳細仕様](https://maps.gsi.go.jp/development/demtile.html)

## 利用ライブラリ


## React-Leaflet のインストール
```
$ npm install react react-dom leaflet
$ npm install react-leaflet
```

## 最小限の地図サンプル

バグ？でアイコンが読み込まれないため、デフォルトのアイコンを読み込む機能を作り、それをマップ表示側で読み込みます

* src/utils/initLeaflet.ts

```tsx
// add icons
import Leaflet from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// marker setting
let DefaultIcon = Leaflet.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], // アイコンのとがった位置をクリックした位置に合わせるためのオフセット
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;

```

* マップ表示ソース

```tsx
import React, { VFC } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'utils/initLeaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const App: VFC = () => {
  const position = new LatLng(35.3607411, 138.727262);

  return (
    <div className="App">
      <MapContainer center={position} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default App;

```



## クリックした場所の標高を取得する

* イメージ画像

ソース

[標高を求めるプログラム](https://maps.gsi.go.jp/development/elevation.html)をこのプログラム用に移植したものです。


