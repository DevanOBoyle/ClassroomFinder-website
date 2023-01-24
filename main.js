// import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Fill, Stroke, Style} from 'ol/style';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [-13587641.820142383, 4438297.780079307],
    zoom: 15
  })
});

// Vector layer with buildings
const fillStyle = new Fill({
  color: [84, 118, 255, 1]
})
const strokeStyle = new Stroke({
  color: [45, 45, 45, 1],
  width: 1.2
})
const BuildingsGeoJSON = new VectorImageLayer({
  source: new VectorSource({
    url: 'map.geojson', 
    format: new GeoJSON()
  }),
  visible: true,
  title: 'BuildingsGeoJSON',
  style: new Style({
    fill: fillStyle,
    stroke: strokeStyle,
  })
})
map.addLayer(BuildingsGeoJSON);

map.on('click', function(e) {
  console.log(e);
})

