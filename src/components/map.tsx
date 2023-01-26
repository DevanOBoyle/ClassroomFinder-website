import React from "react"
import "../stylesheets/map.scss"
import Map from "ol/Map.js"
import OSM from "ol/source/OSM.js"
import TileLayer from "ol/layer/Tile.js"
import View from "ol/View.js"
import GeoJSON from "ol/format/GeoJSON"
import VectorImageLayer from "ol/layer/VectorImage"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import Overlay from "ol/Overlay"
import XYZ from "ol/source/XYZ"

const map = new Map({
  target: "map_container",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [-13587641.820142383, 4438297.780079307],
    zoom: 15,
  }),
})

// Map layer
const StamenToner = new TileLayer({
  source: new XYZ({
    url: "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
    attributions:
      "Map tiles by Stamen Design, under CC BY 3.0. " +
      "Data by OpenStreetMap, under ODbL.",
  }),
  visible: true,
})
map.addLayer(StamenToner)

// Vector layer with buildings
const fillStyle = new Fill({
  color: [45, 45, 45, 1],
})
const strokeStyle = new Stroke({
  color: [45, 45, 45, 1],
  width: 1.2,
})
const BuildingsGeoJSON = new VectorImageLayer({
  source: new VectorSource({
    url: "map.geojson",
    format: new GeoJSON(),
  }),
  visible: true,
  style: new Style({
    fill: fillStyle,
    stroke: strokeStyle,
  }),
})
map.addLayer(BuildingsGeoJSON)

const MyMap: React.FC = () => {
  return <div id='map_container' className='map_container'></div>
}

export default MyMap
