import React, { useState, useEffect, useRef } from "react"
// import "./index.scss"
import "../../../node_modules/ol/ol.css"

// Openlayers imports
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import Stamen from "ol/source/Stamen.js"
import OSM from "ol/source/OSM.js"
import GeoJSON from "ol/format/GeoJSON"
import VectorImageLayer from "ol/layer/VectorImage"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import Overlay from "ol/Overlay"

function MapWrapper() {
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [overlayLayer, setOverlayLayer] = useState()

  // PlaceId that is returned from the database
  const placeId_BE = "ChIJUfzq4HRBjoARZyoPLQd-ORM"
  // const placeId_HSS = "ChIJ5WaXa6FBjoARz3jyS-_t22A"
  // const placeId_CU = "ChIJ__8_56BBjoARnYLZxB5PFEU"

  // References to the divs
  const mapElement = useRef()
  const textElement = useRef()
  const nameElement = useRef()
  const addressElement = useRef()
  const linkElement = useRef()

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
    const designLayer = new TileLayer({
      source: new Stamen({
        layer: "toner-lite",
      }),
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
        designLayer,
        buildingsLayer,
        // markerLayer,
      ],
      overlays: [initialOverlayLayer],
      view: new View({
        center: [-13587641.820142383, 4438297.780079307],
        zoom: 15,
        minZoom: 13,
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
    overlayRef.current.setPosition([newCoordinates[0] + 490, newCoordinates[1]])
    // Center and zoom the map
    mapRef.current.setView(
      new View({
        center: [newCoordinates[0] + 490, newCoordinates[1] - 100],
        zoom: 16,
        minZoom: 13,
      })
    )
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
  //////// change the input to placeID
  function showInfoById() {
    overlayRef.current.setPosition(undefined) // Close the current window
    showFeatureInfoById(placeId_BE)
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

  // Map click handler
  const handleMapClick = event => {
    // Close the current window
    overlayRef.current.setPosition(undefined)
    showFeatureInfo(event)
  }

  // The HTML containers holding the map and info window
  return (
    <div>
      <div ref={mapElement} id='map' className='map'></div>
      <div ref={textElement} className='overlayContainer'>
        <span
          ref={nameElement}
          className='overlayContainerText'
          id='building-name'
        ></span>
        <br></br>
        <span
          ref={addressElement}
          className='overlayContainerText'
          id='building-address'
        ></span>
        <br></br>
        <span
          ref={linkElement}
          className='overlayContainerText'
          id='building-directions'
        >
          Link to Google maps
        </span>
        <br></br>
      </div>
      <div id='search-button'>
        <button onClick={showInfoById}>Search</button>
      </div>
    </div>
  )
}

export default MapWrapper
