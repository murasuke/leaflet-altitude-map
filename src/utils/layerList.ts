type layerType = {
  name: string;
  attribution: string;
  url: string;
  opacity?: number;
};

const cpw =
  '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>';
const url_gsi = (val: string, ext: string = 'png') =>
  `https://cyberjapandata.gsi.go.jp/xyz/${val}/{z}/{x}/{y}.${ext}`;

export const baseLayers: layerType[] = [
  { name: '国土地理院(標準地図)', attribution: cpw, url: url_gsi('std') },
  {
    name: '国土地理院(白地図)',
    attribution: cpw,
    url: url_gsi('blank', 'jpg'),
  },
  {
    name: '国土地理院(写真:最新)',
    attribution: cpw,
    url: url_gsi('seamlessphoto', 'jpg'),
  },
  {
    name: '国土地理院(写真:1987年～1990年)',
    attribution: cpw,
    url: url_gsi('gazo4', 'jpg'),
  },
  {
    name: '国土地理院(写真:1974年～1978年)',
    attribution: cpw,
    url: url_gsi('gazo1', 'jpg'),
  },
  {
    name: 'penStreetMap.Mapnik',
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
];

export const overlayLayers: layerType[] = [
  {
    name: '赤色立体地図',
    attribution:
      '&copy; <a href="https://www.rrim.jp/">アジア航測株式会社の赤色立体地図作成手法（特許3670274、特許4272146）を使用</a>',
    url: url_gsi('sekishoku'),
    opacity: 0.5,
  },
  {
    name: '地質図',
    attribution:
      '&copy; <a href="https://gbank.gsj.jp/seamless/v2/api/1.2/">産総研地質調査総合センター</a>',
    url: 'https://gbank.gsj.jp/seamless/v2/api/1.2/tiles/{z}/{y}/{x}.png',
    opacity: 0.5,
  },
  {
    name: '地すべり地形分布図',
    attribution:
      '&copy; <a href="https://www.j-shis.bosai.go.jp/landslidemap">防災科研</a>',
    url: 'https://jmapweb3v.bosai.go.jp/map/xyz/landslide/{z}/{x}/{y}.png',
    opacity: 0.5,
  },
];
