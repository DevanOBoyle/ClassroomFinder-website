// import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Fill, Stroke, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import XYZ from 'ol/source/XYZ';

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

// Map layer
const StamenToner = new TileLayer({
  source: new XYZ({
    url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
    attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
  }),
  visible: true,
  title: 'StamenToner'
})
map.addLayer(StamenToner);


// Vector layer with buildings
const fillStyle = new Fill({
  color: [45, 45, 45, 1]
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

const overlayContainerElement = document.querySelector('.overlayContainer');
const overlayLayer = new Overlay({
  element: overlayContainerElement
});
map.addOverlay(overlayLayer);
const overlayBuildingName = document.getElementById('buildingName');
const overlayBuildingAddress = document.getElementById('buildingAddress');



// When clicking on the map
map.on('click', function(e) {
  overlayLayer.setPosition(undefined);
  map.forEachFeatureAtPixel(e.pixel, function(feature, layer) {
    let clickedCoord = e.coordinate;
    let clickedBuildingName = feature.get('name');
    let clickedBuildingAddress= feature.get('address');
    overlayLayer.setPosition(clickedCoord);
    overlayBuildingName.innerHTML = clickedBuildingName;
    overlayBuildingAddress.innerHTML = clickedBuildingAddress;
  })
})

