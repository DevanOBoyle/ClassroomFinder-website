import React, { useState, useEffect, useRef } from "react"
import "../stylesheets/textstyle.scss"
import "./page.scss"
import "../../node_modules/ol/ol.css"

// Openlayers imports
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import Stamen from "ol/source/Stamen"
import OSM from "ol/source/OSM"
import GeoJSON from "ol/format/GeoJSON"
import VectorImageLayer from "ol/layer/VectorImage"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import Overlay from "ol/Overlay"

// Booleans
var search
var info
var toggleRight
var buildingMarked = false

// Finding the floormaps
const floorMapBaseFolder = "/floormaps/"
var floorMapFolder
var floorMapHref

export default function MapPage() {
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [overlayLayer, setOverlayLayer] = useState()

  // References to the divs
  const mapElement = useRef()
  const mapPin = useRef()
  const textElement = useRef()
  const nameElement = useRef()
  const addressElement = useRef()
  const linkElement = useRef()

  const mapRef = useRef()
  mapRef.current = map
  const featRef = useRef()
  featRef.current = featuresLayer
  const overlayRef = useRef()
  overlayRef.current = overlayLayer

  // Keep track of what is shown and not
  search = true
  info = false
  toggleRight = false
  // const [searchStyle, setSearchStyle] = useState("search1")
  // const [infoStyle, setInfoStyle] = useState("info1")

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

    // Create an overlay container that will show a pin on the map
    const initialOverlayLayer = new Overlay({
      element: mapPin.current,
      positioning: "bottom-center",
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

  function toggleClick() {
    document.getElementById("roomForm").style.display = toggleRight
      ? "contents"
      : "none"
    document.getElementById("classForm").style.display = toggleRight
      ? "none"
      : "contents"
    document.getElementById("searchToggleTextRoom").style.color = toggleRight
      ? "rgb(253 199 0 / 100%)"
      : "black"
    document.getElementById("searchToggleTextClass").style.color = toggleRight
      ? "black"
      : "rgb(253 199 0 / 100%)"
    document.getElementById("searchToggleSlide").style.left = toggleRight
      ? "6px"
      : "auto"
    document.getElementById("searchToggleSlide").style.right = toggleRight
      ? "auto"
      : "6px"
    toggleRight = !toggleRight
  }

  function searchButtonClick() {
    // Change the size of the search window and show/hide content
    if (search) {
      // Hide content
      document.getElementById("searchDiv").style.display = "none"
      document.getElementById("searchText").style.display = "block"
      document.getElementById("searchArrow").style.transform = "rotate(180deg)"
      document.getElementById("searchArrow").style.bottom = "10px"
    } else {
      // Show content
      document.getElementById("searchDiv").style.display = "flex"
      document.getElementById("searchText").style.display = "none"
      document.getElementById("searchArrow").style.transform = "rotate(0)"
      document.getElementById("searchArrow").style.bottom = "10px"
    }
    search = !search
  }

  function openInfoWindow() {
    document.getElementById("infoDiv").style.display = buildingMarked
      ? "block"
      : "none"
    document.getElementById("infoNobuildingText").style.display = buildingMarked
      ? "none"
      : "block"
    document.getElementById("infoText").style.display = "none"
    document.getElementById("infoArrow").style.transform = "rotate(180deg)"
    document.getElementById("infoArrow").style.top = "10px"
    info = true
  }

  function closeInfoWindow() {
    document.getElementById("infoDiv").style.display = "none"
    document.getElementById("infoNobuildingText").style.display = "none"
    document.getElementById("infoText").style.display = "block"
    document.getElementById("infoArrow").style.transform = "rotate(0)"
    document.getElementById("infoArrow").style.top = "10px"
    info = false
  }

  function infoButtonClick() {
    // Change the size of the info window and show/hide content
    if (info) closeInfoWindow()
    else openInfoWindow()
  }

  // Show info at click
  function showFeatureInfo(e) {
    mapRef.current.forEachFeatureAtPixel(e.pixel, function (building) {
      buildingMarked = true
      // Place a marker
      overlayRef.current.setPosition(e.coordinate)
      // Set text
      // nameElement.current.innerHTML = building.getId()
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
      // Change the options of the drop-down menu
      var selectCode = ""
      const floorFileNames = building.get("floors")
      if (floorFileNames.length > 0) {
        selectCode +=
          "<option value='" +
          floorFileNames[0][0] +
          "' selected>" +
          floorFileNames[0][1] +
          "</option>"
        let i = 1
        while (floorFileNames.length > i) {
          selectCode +=
            "<option value='" +
            floorFileNames[i][0] +
            "'>" +
            floorFileNames[i][1] +
            "</option>"
          i++
        }
      }
      document.getElementById("floorDropdownSelect").innerHTML = selectCode
      // Show the right floor plan image
      floorMapFolder = floorMapBaseFolder + building.getId() + "/"
      floorMapHref =
        floorMapFolder + document.getElementById("floorDropdownSelect").value
      document.getElementById("floorMap").src = floorMapHref
      // Make sure the info window is open
      openInfoWindow()
    })
  }

  // Map click handler
  const handleMapClick = event => {
    showFeatureInfo(event)
  }

  function selectFloorMap() {
    // console.log(document.getElementById("floorDropdownSelect").value)
    floorMapHref =
      floorMapFolder + document.getElementById("floorDropdownSelect").value
    document.getElementById("floorMap").src = floorMapHref
  }

  return (
    <div id='main'>
      <div id='searchWindow'>
        <div id='searchDiv'>
          <div id='searchToggle' onClick={toggleClick}>
            <div id='searchToggleField'></div>
            <div id='searchToggleSlide'></div>
            <h4 id='searchToggleTextRoom'>Room</h4>
            <h4 id='searchToggleTextClass'>Class code</h4>
          </div>
          <div id='inputDiv'>
            <div id='roomForm'>
              <div className='searchBar'>
                <input
                  type='text'
                  id='classroomInput'
                  className='input'
                  placeholder='e.g. "R Carson 205"'
                  maxLength={60}
                  required
                />
                <div className='searchBarField'></div>
                <div className='searchBarButton'>
                  <input type='submit' id='roomSubmitButton' value=''></input>
                  <img id='roomArrow' src='/arrowcircle.png'></img>
                </div>
              </div>
            </div>
            <div id='classForm'>
              <div id='quarterDropdown'>
                <select id='quarterDropdownSelect' defaultValue={"w23"}>
                  <option value='f22'>Fall 22</option>
                  <option value='w23'>Winter 23</option>
                  <option value='s23'>Spring 23</option>
                </select>
                <div id='quarterDropdownField'></div>
                <img
                  id='quarterArrowCircle'
                  src='/arrowcircle.png'
                  className='arrowCircle'
                ></img>
              </div>
              <div className='searchBar'>
                <input
                  type='text'
                  id='classcodeInput'
                  className='input'
                  placeholder='e.g. "CSE123-01"'
                  pattern='^[a-zA-Z]{2,4}\d{2,4}[a-zA-Z]{0,1}-\d{2}$'
                  required
                />
                <div className='searchBarField'></div>
                <div className='searchBarButton'>
                  <input
                    type='submit'
                    id='classcodeSubmitButton'
                    value=''
                  ></input>
                  <img id='classcodeArrow' src='/arrowcircle.png'></img>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h4 id='searchText'>Search</h4>
        <img
          id='searchArrow'
          className='arrow'
          src='/arrow.png'
          onClick={searchButtonClick}
        ></img>
      </div>
      <div ref={mapElement} id='map' className='map'></div>
      <img
        ref={mapPin}
        id='pin'
        src={
          "http://icons.iconarchive.com/icons/icons-land/vista-map-markers" +
          "/256/Map-Marker-Ball-Pink-icon.png"
        }
      ></img>
      <div id='infoWindow'>
        <h4 id='infoText'>Info</h4>
        <img
          id='infoArrow'
          className='arrow'
          src='/arrow.png'
          onClick={infoButtonClick}
        ></img>
        <h6 id='infoNobuildingText'>
          Click on a building or search for a classroom to show floor plans and
          get directions
        </h6>
        <div id='infoDiv'>
          <div ref={textElement} className='infoDivText' id='infoDivText'>
            <h5
              ref={nameElement}
              className='infoDivText'
              id='building-name'
            ></h5>
            <br></br>
            <h6
              ref={addressElement}
              className='infoDivText'
              id='building-address'
            ></h6>
            <br></br>
            <span
              ref={linkElement}
              className='infoDivText'
              id='building-directions'
            ></span>
            <br></br>
            <div className='floorDropdown' id='floorDropdown'>
              <select
                id='floorDropdownSelect'
                onInput={selectFloorMap}
              ></select>
              <div id='floorDropdownField'></div>
              <img
                id='floorArrowCircle'
                src='/arrowcircle.png'
                className='arrowCircle'
              ></img>
            </div>
          </div>
          <div id='infoLine'></div>
          <img id='floorMap'></img>
        </div>
      </div>
    </div>
  )
}
