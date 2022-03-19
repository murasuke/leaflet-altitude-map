import Leaflet from 'leaflet';

type LeafletClass = (new (...args: any[]) => any) & typeof Leaflet.Class;

type UrlInfo = {
  title: string;
  url: string;
  minzoom: number;
  maxzoom: number;
  fixed: number;
};

export type Position = {
  lat: number;
  lng: number;
  zoom: number;
};

export type AltitudeDetail = {
  fixed: number;
  h: number;
  pos: Position;
  title: string;
  type: string;
};

type altitudeCallback = (height?: string, detail?: AltitudeDetail) => void;

type funcRefresh = (
  lat: number,
  lon: number,
  initialz: number,
  callback?: altitudeCallback,
) => void;

type GSIType = {
  Footer: LeafletClass;
  ElevationLoader: LeafletClass;
  content?: LeafletClass & { execRefresh: funcRefresh };
};

/**
 * 位置から標高を求める
 * https://maps.gsi.go.jp/development/elevation.html
 * ・国土地理院の「標高を求めるプログラム(https://maps.gsi.go.jp/development/elevation.html)」を参考にしました
 * ・関数「getAltitude()」で指定した位置の標高をcallback関数で返します。
 * ■概略(国土地理院のサンプル解説から引用)
 * 　・入力した経緯度値から、その場所に該当する「標高タイル」（PNG形式）をクライアントにダウンロードしてきます。
 * 　・入力した経緯度値に該当する「標高タイル」のピクセルの画素値（RGB値）から、標高値が算出されます。
 * 　・「標高タイル」には、「DEM5A」、「DEM5B」、「DEM5C」、「DEM10B」、「DEMGM」の4種類があります（本サンプルプログラムでは「DEMGM」は使用していません）。
 * 　・標高タイルの精度は、「DEM5A」＞「DEM5B」＞「DEM5C」＞「DEM10B」＞「DEMGM」の順に高精度になります。
 * 　・「DEM5A」、「DEM5B」及び「DEM5C」は、日本全国の範囲でデータが整備されていません。
 * 　・そのため、本プログラムでは、まず「DEM5A」のデータを探して、なければ「DEM5B」、「DEM5B」もなければ「DEM5C」、最後に「DEM10B」を使用するという処理をしています。
 * 　・また、海部などデータが存在しないところのピクセル値は、(R,G,B)=(128,0,0)となっています。
 * 　・標高タイルの詳細仕様はこちらを参照してください。

 *
 */
const GSI: GSIType = {
  Footer: Leaflet.Class.extend({
    initialize() {},
    destroy() {},

    clear() {
      if (this._elevationLoader) {
        this._elevationLoader.cancel();
      }
    },

    execRefresh(
      lon: number,
      lat: number,
      zoom: number,
      callback?: altitudeCallback,
    ) {
      if (!this._elevationLoader) {
        this._elevationLoader = new GSI.ElevationLoader();
        this._elevationLoader.on(
          'load',
          Leaflet.bind((e) => {
            if (callback)
              if (e.h === undefined) {
                callback(undefined, e);
              } else {
                const height = e.h.toFixed(e.fixed !== undefined ? e.fixed : 0);
                callback(height, e);
              }
          }, this),
        );
      }

      this._elevationLoader.load({
        lat: lat,
        lng: lon,
        zoom: zoom,
      });
    },
  }),

  ElevationLoader: Leaflet.Evented.extend({
    _demUrlList: [
      {
        title: 'DEM5A',
        url: 'https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/{z}/{x}/{y}.png',
        minzoom: 15,
        maxzoom: 15,
        fixed: 1,
      },
      {
        title: 'DEM5B',
        url: 'https://cyberjapandata.gsi.go.jp/xyz/dem5b_png/{z}/{x}/{y}.png',
        minzoom: 15,
        maxzoom: 15,
        fixed: 1,
      },
      {
        title: 'DEM5C',
        url: 'https://cyberjapandata.gsi.go.jp/xyz/dem5c_png/{z}/{x}/{y}.png',
        minzoom: 15,
        maxzoom: 15,
        fixed: 1,
      },
      {
        title: 'DEM10B',
        url: 'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png',
        minzoom: 14,
        maxzoom: 14,
        fixed: 0,
      },
    ],
    pow2_8: Math.pow(2, 8),
    pow2_16: Math.pow(2, 16),
    pow2_23: Math.pow(2, 23),
    pow2_24: Math.pow(2, 24),

    initialize(map: any, options: any) {
      this._map = map;
    },

    load(pos: Position) {
      this._destroyImage();

      this._current = {
        pos: pos,
        urlList: this._makeUrlList(pos),
      };

      this._load(this._current);
    },

    _makeUrlList(pos: Position) {
      const list = [];
      for (var i = 0; i < this._demUrlList.length; i++) {
        const demUrl = this._demUrlList[i];

        if (demUrl.maxzoom < demUrl.minzoom) {
          const buff = demUrl.maxzoom;
          demUrl.maxzoom = demUrl.minzoom;
          demUrl.minzoom = buff;
        }

        const minzoom = demUrl.minzoom;

        for (var z = demUrl.maxzoom; z >= minzoom; z--) {
          list.push({
            title: demUrl.title,
            zoom: z,
            url: demUrl.url,
            fixed: demUrl.fixed,
          });
        }
      }
      return list;
    },

    _destroyImage() {
      if (this._img) {
        this._img.removeEventListener('load', this._imgLoadHandler);
        this._img.removeEventListener('error', this._imgLoadErrorHandler);

        this._imgLoadHandler = null;
        this._imgLoadErrorHandler = null;

        delete this._img;
        this._img = null;
      }
    },

    cancel() {
      this._destroyImage();
    },

    _load(current: any) {
      this._destroyImage();

      if (this._current !== current) return;

      if (!this._current.urlList || this._current.urlList.length <= 0) {
        // not found
        this.fire('load', {
          h: undefined,
          pos: current.pos,
        });
        return;
      }

      const url = this._current.urlList.shift();

      const tileInfo = this._getTileInfo(
        this._current.pos.lat,
        this._current.pos.lng,
        url.zoom,
      );
      this._img = document.createElement('img');
      this._img.setAttribute('crossorigin', 'anonymous');

      this._imgLoadHandler = Leaflet.bind(
        this._onImgLoad,
        this,
        url,
        current,
        tileInfo,
        this._img,
      );
      this._imgLoadErrorHandler = Leaflet.bind(
        this._onImgLoadError,
        this,
        url,
        current,
        tileInfo,
        this._img,
      );

      this._img.addEventListener('load', this._imgLoadHandler);
      this._img.addEventListener('error', this._imgLoadErrorHandler);

      const makeUrl = (url: any, tileInfo: any) => {
        var result = url.url.replace('{x}', tileInfo.x);
        result = result.replace('{y}', tileInfo.y);
        result = result.replace('{z}', url.zoom);
        return result;
      };

      this._img.src = makeUrl(url, tileInfo);
    },

    _onImgLoad(url: UrlInfo, current: any, tileInfo: any, img: any) {
      if (current !== this._current) return;

      if (!this._canvas) {
        this._canvas = document.createElement('canvas');
        this._canvas.width = 256;
        this._canvas.height = 256;
      }

      var ctx = this._canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, 256, 256);
      const idx = tileInfo.pY * 256 * 4 + tileInfo.pX * 4;
      const r = imgData.data[idx + 0];
      const g = imgData.data[idx + 1];
      const b = imgData.data[idx + 2];
      var h = 0;

      if (r !== 128 || g !== 0 || b !== 0) {
        const d = r * this.pow2_16 + g * this.pow2_8 + b;
        h = d < this.pow2_23 ? d : d - this.pow2_24;
        if (h === -this.pow2_23) h = 0;
        else h *= 0.01;
        this._destroyImage();

        this.fire('load', {
          h: h,
          title: url.title,
          fixed: url.fixed,
          pos: current.pos,
        });
      } else {
        this._onImgLoadError(url, current, tileInfo, img);
      }
    },

    _onImgLoadError(url: UrlInfo, current: any, tileInfo: any, img: any) {
      if (current !== this._current) return;
      this._load(current);
    },

    _getTileInfo(lat: number, lng: number, z: number) {
      const lng_rad = (lng * Math.PI) / 180;
      const R = 128 / Math.PI;
      const worldCoordX = R * (lng_rad + Math.PI);
      const pixelCoordX = worldCoordX * Math.pow(2, z);
      const tileCoordX = Math.floor(pixelCoordX / 256);

      const lat_rad = (lat * Math.PI) / 180;
      const worldCoordY =
        (-R / 2) * Math.log((1 + Math.sin(lat_rad)) / (1 - Math.sin(lat_rad))) +
        128;
      const pixelCoordY = worldCoordY * Math.pow(2, z);
      const tileCoordY = Math.floor(pixelCoordY / 256);

      return {
        x: tileCoordX,
        y: tileCoordY,
        pX: Math.floor(pixelCoordX - tileCoordX * 256),
        pY: Math.floor(pixelCoordY - tileCoordY * 256),
      };
    },
  }),
};

GSI.content = new GSI.Footer();

/**
 * 位置から標高を求める関数
 * @param lat
 * @param lon
 * @param callback
 */
export const getAltitude = (
  lat: number,
  lon: number,
  callback?: altitudeCallback,
) => {
  const initialz = 14;
  GSI.content?.execRefresh(lon, lat, initialz, callback);
};
