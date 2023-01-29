import React, { useState, useEffect, useRef } from "react"
import "../stylesheets/map.scss"

// Openlayers imports
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM.js"
import GeoJSON from "ol/format/GeoJSON"
import VectorImageLayer from "ol/layer/VectorImage"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Fill, Stroke, Style } from "ol/style"
import Overlay from "ol/Overlay"
import XYZ from "ol/source/XYZ"
import { useGeographic } from "ol/proj.js"

function MapWrapper() {
  // useGeographic()

  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [overlayLayer, setOverlayLayer] = useState()
  // const [selectedCoord, setSelectedCoord] = useState()

  // pull refs
  // const mapElement = useRef<HTMLDivElement>(null)
  // create state ref that can be accessed in OpenLayers onclick
  // callback function https://stackoverflow.com/a/60643670

  // References to the divs
  // PlaceId that is returned from the database
  const placeId = "ChIJUfzq4HRBjoARZyoPLQd-ORM"
  const mapElement = useRef()
  const textElement = useRef()
  const nameElement = useRef()
  const addressElement = useRef()
  const linkElement = useRef()
  const searchButton = useRef()

  const mapRef = useRef()
  mapRef.current = map
  const overlayRef = useRef()
  overlayRef.current = overlayLayer
  const featRef = useRef()
  featRef.current = featuresLayer

  /*
  // Add a marker
  var vectorLayer = new VectorLayer({
    source: new VectorSource(),
  })

  var markerLayer = new VectorLayer({
    source: new VectorSource({
      features: [
        new Feature({
          geometry: new Point([-13587504, 4438692]),
        }),
      ],
    }),
    visible: false,
  })
  */

  // Initialize map
  useEffect(() => {
    // Vector layer with buildings
    const fillStyle = new Fill({
      color: [45, 45, 45, 1],
    })
    const strokeStyle = new Stroke({
      color: [45, 45, 45, 1],
      width: 1.2,
    })
    const buildingsSource = new VectorSource({
      url: "/map.geojson",
      format: new GeoJSON(),
    })
    const buildingsLayer = new VectorImageLayer({
      source: buildingsSource,
      visible: true,
      style: new Style({
        fill: fillStyle,
        stroke: strokeStyle,
      }),
    })

    // Grey-scale design layer
    const StamenToner = new TileLayer({
      source: new XYZ({
        url: "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
        attributions:
          "Map tiles by Stamen Design, under CC BY 3.0. " +
          "Data by OpenStreetMap, under ODbL.",
      }),
      visible: true,
    })

    // Create an overlay text container that will show info on the map
    const initialOverlayLayer = new Overlay({
      element: textElement.current,
    })

    // Create the map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        StamenToner,
        buildingsLayer,
        // markerLayer,
      ],
      overlays: [initialOverlayLayer],
      view: new View({
        center: [-13587641.820142383, 4438297.780079307],
        zoom: 15,
      }),
    })
    // Handle map click
    initialMap.on("click", handleMapClick)

    setMap(initialMap)
    setFeaturesLayer(buildingsLayer)
    setOverlayLayer(initialOverlayLayer)
  }, [])

  // Show an info window by placeId
  function showFeatureInfoById(id) {
    // Find the building in the GeoJSON file by placeId
    let building = featRef.current.getSource().getFeatureById(id)
    // Set position
    let newCoordinates = building.getGeometry().geometries_[0].getCoordinates()
    overlayRef.current.setPosition([newCoordinates[0] + 500, newCoordinates[1]])
    // How to know the coordinates? ///////////////////////
    // Set text
    nameElement.current.innerHTML = building.get("name")
    addressElement.current.innerHTML = building.get("address")
    let dirUrl = "https://www.google.com/maps/place/?q=place_id:" + id
    let linkText = "Get directions on Google Maps"
    linkElement.current.innerHTML =
      '<a href="' +
      dirUrl +
      '" target="_blank" rel="noopener noreferrer">' +
      linkText +
      "</a>"
  }

  // Handle the placeID received from the database
  function showInfoById(e) {
    overlayRef.current.setPosition(undefined) // Close the current window
    showFeatureInfoById(placeId)
  }

  // Show an info window at click
  function showFeatureInfo(e) {
    mapRef.current.forEachFeatureAtPixel(e.pixel, function (building) {
      // Set position
      overlayRef.current.setPosition(e.coordinate)
      // Set text
      nameElement.current.innerHTML = building.get("name")
      addressElement.current.innerHTML = building.get("address")
      let dirUrl =
        "https://www.google.com/maps/place/?q=place_id:" + building.getId()
      let linkText = "Get directions on Google Maps"
      linkElement.current.innerHTML =
        '<a href="' +
        dirUrl +
        '" target="_blank" rel="noopener noreferrer">' +
        linkText +
        "</a>"
    })
  }

  // map click handler
  const handleMapClick = event => {
    overlayRef.current.setPosition(undefined) // Close the current window
    showFeatureInfo(event)
  }

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
        <span
          ref={linkElement}
          className='overlayContainerText'
          id='buildingDirections'
        >
          Link to Google maps
        </span>
        <br></br>
      </div>
      <div id='searchButton'>
        <button onClick={showInfoById}>Search</button>
      </div>
    </div>
  )
}

export default MapWrapper
