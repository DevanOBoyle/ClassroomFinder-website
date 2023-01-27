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

function MapWrapper(props) {
  // set intial state
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  // const [selectedCoord, setSelectedCoord] = useState()

  // pull refs
  const mapElement = useRef()
  const nameElement = useRef()
  const addressElement = useRef()
  const textElement = useRef()

  // create state ref that can be accessed in OpenLayers onclick callback
  // function
  // https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

  const style = new Style({
    fill: new Fill({
      color: "#eeeeee",
    }),
  })

  // Vector layer with buildings
  const fillStyle = new Fill({
    color: [45, 45, 45, 1],
  })
  const strokeStyle = new Stroke({
    color: [45, 45, 45, 1],
    width: 1.2,
  })
  // create and add vector source layer
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
        // projection: "EPSG:3857",
      }),
    })
    /*
    const featureOverlay = new VectorLayer({
      source: new VectorSource(),
      map: map,
      style: new Style({
        stroke: new Stroke({
          color: "rgba(255, 255, 255, 0.7)",
          width: 2,
        }),
      }),
    }) */
    /*

    // const overlayContainerElement = textElement
    /*
    const overlayLayer = new Overlay({ // NOT WORKING!
      element: overlayContainerElement,
    })
    initialMap.addOverlay(overlayLayer)
    // const overlayBuildingName = document.getElementById("buildingName")
    // const overlayBuildingAddress = document.getElementById("buildingAddress")
    */
    // set map onclick handler
    initialMap.on("click", function (e) {
      initialMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        let clickedCoord = e.coordinate
        let clickedBuildingName = feature.get("name")
        let clickedBuildingAddress = feature.get("address")
        console.log(clickedBuildingName)
        console.log(clickedBuildingAddress)
      })
    })

    // save map and vector layer references to state
    setMap(initialMap)
    setFeaturesLayer(initialFeaturesLayer)
  }, [])

  // update map if features prop changes - logic formerly put
  // into componentDidUpdate
  /*
  useEffect(() => {
    if (props.features.length) {
      // may be null on first render
      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: props.features,
          // make sure features is an array
        })
      )
      // fit map to feature extent (with 100px of padding)
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100, 100, 100, 100],
      })
    }
  }, [props.features]) */

  // map click handler
  const handleMapClick = event => {
    console.log(event.pixel)

    /*
    // get clicked coordinate using mapRef to access current
    // React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel)

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, "EPSG:3857", "EPSG:4326")

    // set React state
    setSelectedCoord(transormedCoord) */
  }

  // render component
  return (
    <div>
      <div ref={mapElement} className='map-container'></div>
      <div ref={textElement} className='overlayContainer'>
        <span
          ref={nameElement}
          className='overlayContainerText'
          id='buildingName'
        >
          Hej
        </span>
        <br></br>
        <span
          ref={addressElement}
          className='overlayContainerText'
          id='buildingAddress'
        >
          Hejda
        </span>
        <br></br>
      </div>
    </div>
  )
}

export default MapWrapper
