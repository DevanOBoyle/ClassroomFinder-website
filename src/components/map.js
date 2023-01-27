// react
import React, { useState, useEffect, useRef } from "react"
import "../stylesheets/map.scss"

// openlayers
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM.js"
import GeoJSON from "ol/format/GeoJSON"
import VectorImageLayer from "ol/layer/VectorImage"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import Overlay from "ol/Overlay"
import XYZ from "ol/source/XYZ"
import VectorLayer from "ol/layer/Vector"
import { transform } from "ol/proj"
import { toStringXY } from "ol/coordinate"

function MapWrapper() {
  // pull refs
  const mapElement = useRef()
  const nameElement = useRef()
  const addressElement = useRef()
  const textElement = useRef()

  // Vector layer with buildings
  const fillStyle = new Fill({
    color: [45, 45, 45, 1],
  })
  const strokeStyle = new Stroke({
    color: [45, 45, 45, 1],
    width: 1.2,
  })
  const initialFeaturesLayer = new VectorImageLayer({
    source: new VectorSource({
      url: "/map.geojson",
      format: new GeoJSON(),
    }),
    visible: true,
    style: new Style({
      fill: fillStyle,
      stroke: strokeStyle,
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

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        StamenToner,
        initialFeaturesLayer,
      ],
      view: new View({
        center: [-13587641.820142383, 4438297.780079307],
        zoom: 15,
      }),
    })

    // Text container that will show info on the map
    const overlayContainerElement = textElement.current
    const overlayLayer = new Overlay({
      element: overlayContainerElement,
    })
    initialMap.addOverlay(overlayLayer)
    const overlayBuildingName = nameElement.current
    const overlayBuildingAddress = addressElement.current

    // Map onclick handler
    initialMap.on("click", function (e) {
      overlayLayer.setPosition(undefined)
      initialMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        let clickedCoord = e.coordinate
        let clickedBuildingName = feature.get("name")
        let clickedBuildingAddress = feature.get("address")
        console.log(clickedBuildingName)
        console.log(clickedBuildingAddress)
        overlayLayer.setPosition(clickedCoord)
        overlayBuildingName.innerHTML = clickedBuildingName
        overlayBuildingAddress.innerHTML = clickedBuildingAddress
      })
    })
  }, [])

  // The HTML containers holding the map and info window
  return (
    <div>
      <div ref={mapElement} className='map-container'></div>
      <div ref={textElement} className='overlayContainer'>
        <span
          ref={nameElement}
          className='overlayContainerText'
          id='buildingName'
        ></span>
        <br></br>
        <span
          ref={addressElement}
          className='overlayContainerText'
          id='buildingAddress'
        ></span>
        <br></br>
      </div>
    </div>
  )
}

export default MapWrapper
