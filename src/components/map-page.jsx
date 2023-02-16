import React, { useState, useEffect, useRef } from "react"
import "../stylesheets/textstyle.scss"
import "./page.scss"
import "../../node_modules/ol/ol.css"
import getBuilding from "../utils/api"

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
const googleMapsLinkBase = "https://www.google.com/maps/place/?q=place_id:"

export default function MapPage() {
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [overlayLayer, setOverlayLayer] = useState()
  const [buildings, setBuildings] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [wordEntered, setWordEntered] = useState("")

  // References to the divs
  const mapElement = useRef()
  const mapPin = useRef()
  const nameElement = useRef()
  const addressElement = useRef()

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
      controls: [],
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

    getBuilding(setBuildings)
  }, [])

  function toggleClick() {
    document.getElementById("room-form").style.display = toggleRight
      ? "contents"
      : "none"
    document.getElementById("class-form").style.display = toggleRight
      ? "none"
      : "contents"
    document.getElementById("search-toggle-text-room").style.color = toggleRight
      ? "rgb(253 199 0 / 100%)"
      : "black"
    document.getElementById("search-toggle-text-class").style.color =
      toggleRight ? "black" : "rgb(253 199 0 / 100%)"
    document.getElementById("search-toggle-slide").style.left = toggleRight
      ? "1.5%"
      : "auto"
    document.getElementById("search-toggle-slide").style.right = toggleRight
      ? "auto"
      : "1.5%"
    toggleRight = !toggleRight
  }

  function searchButtonClick() {
    // Change the size of the search window and show/hide content
    if (search) {
      // Hide content
      document.getElementById("search-div").style.display = "none"
      document.getElementById("search-text").style.display = "block"
      document.getElementById("search-arrow").style.transform = "rotate(180deg)"
      document.getElementById("search-arrow").style.bottom = "10px"
    } else {
      // Show content
      document.getElementById("search-div").style.display = "flex"
      document.getElementById("search-text").style.display = "none"
      document.getElementById("search-arrow").style.transform = "rotate(0)"
      document.getElementById("search-arrow").style.bottom = "10px"
    }
    search = !search
  }

  function openInfoWindow() {
    document.getElementById("info-div").style.display = buildingMarked
      ? "block"
      : "none"
    document.getElementById("info-nobuilding-text").style.display =
      buildingMarked ? "none" : "block"
    document.getElementById("info-text").style.display = "none"
    document.getElementById("info-arrow").style.transform = "rotate(180deg)"
    document.getElementById("info-arrow").style.top = "10px"
    info = true
  }

  function closeInfoWindow() {
    document.getElementById("info-div").style.display = "none"
    document.getElementById("info-nobuilding-text").style.display = "none"
    document.getElementById("info-text").style.display = "block"
    document.getElementById("info-arrow").style.transform = "rotate(0)"
    document.getElementById("info-arrow").style.top = "10px"
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
      document.getElementById("building-directions").href =
        googleMapsLinkBase + building.getId()
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
      document.getElementById("floor-dropdown-select").innerHTML = selectCode
      // Show the right floor plan image
      floorMapFolder = floorMapBaseFolder + building.getId() + "/"
      floorMapHref =
        floorMapFolder + document.getElementById("floor-dropdown-select").value
      document.getElementById("floor-map").src = floorMapHref
      // Make sure the info window is open
      openInfoWindow()
    })
  }

  // Search filter handler
  const handleFilter = event => {
    const searchWord = event.target.value
    setWordEntered(searchWord)
    const newFilter = buildings.filter(value => {
      return value.name.toLowerCase().includes(searchWord.toLowerCase())
    })

    console.log(newFilter)

    if (searchWord === "") {
      setFilteredData([])
    } else {
      setFilteredData(newFilter)
    }
  }

  const handleFilterClick = name => {
    setWordEntered(name)
  }

  // Search filter handler
  const handleFilter = event => {
    const searchWord = event.target.value
    setWordEntered(searchWord)
    const newFilter = buildings.filter(value => {
      return value.name.toLowerCase().includes(searchWord.toLowerCase())
    })

    console.log(newFilter)

    if (searchWord === "") {
      setFilteredData([])
    } else {
      setFilteredData(newFilter)
    }
  }

  const handleFilterClick = name => {
    setWordEntered(name)
  }

  // -map click handler
  const handleMapClick = event => {
    showFeatureInfo(event)
  }

  function selectFloorMap() {
    // console.log(document.getElementById("floor-dropdownSelect").value)
    floorMapHref =
      floorMapFolder + document.getElementById("floor-dropdown-select").value
    document.getElementById("floor-map").src = floorMapHref
  }

  function showFullScreen() {
    let image = document.getElementById("floor-map")
    if (!document.fullscreenElement) {
      image?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div id='main'>
      <div id='search-window'>
        <div id='search-div'>
          <div id='search-toggle' onClick={toggleClick}>
            <div id='search-toggle-field'></div>
            <div id='search-toggle-slide'></div>
            <h4 id='search-toggle-text-room'>Room</h4>
            <div id='search-toggle-text-class'>
              <h4>Class code</h4>
            </div>
          </div>
          <div id='input-div'>
            <div id='room-form'>
              <div className='search-bar'>
                <input
                  type='text'
                  id='classroom-input'
                  className='input'
                  placeholder='e.g. "R Carson 205"'
                  maxLength={60}
                  value={wordEntered}
                  onChange={handleFilter}
                  required
                />
                <div className='search-bar-field'></div>
                <div className='search-bar-button'>
                  <input type='submit' id='room-submit-button' value=''></input>
                  <img id='room-arrow' src='/arrowcircle.png'></img>
                </div>
                <div className='search-bar-arrow right'></div>
                <div>
                  {filteredData.length != 0 && (
                    <div className='dataResult'>
                      {filteredData.slice(0, 15).map((value, key) => {
                        return (
                          <a
                            key={key}
                            onClick={() => handleFilterClick(value.name)}
                            className='dataItem'
                            target='_blank'
                          >
                            {" "}
                            <p>{value.name}</p>{" "}
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div id='class-form'>
              <div id='quarter-dropdown'>
                <select id='quarter-dropdown-select' defaultValue={"w23"}>
                  <option value='f22'>Fall 22</option>
                  <option value='w23'>Winter 23</option>
                  <option value='s23'>Spring 23</option>
                </select>
                <div id='quarter-dropdown-field'></div>
                <img
                  id='quarter-arrow-circle'
                  src='/arrowcircle.png'
                  className='arrow-circle'
                ></img>
              </div>
              <div className='search-bar'>
                <input
                  type='text'
                  id='classcode-input'
                  className='input'
                  placeholder='e.g. "CSE123-01"'
                  pattern='^[a-zA-Z]{2,4}\d{2,4}[a-zA-Z]{0,1}-\d{2}$'
                  required
                />
                <div className='search-bar-field'></div>
                <div className='search-bar-button'>
                  <input
                    type='submit'
                    id='classcode-submit-button'
                    value=''
                  ></input>
                  <img id='classcode-arrow' src='/arrowcircle.png'></img>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h4 id='search-text'>Search</h4>
        <img
          id='search-arrow'
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
      <div id='info-window'>
        <h4 id='info-text'>Info</h4>
        <img
          id='info-arrow'
          className='arrow'
          src='/arrow.png'
          onClick={infoButtonClick}
        ></img>
        <h6 id='info-nobuilding-text'>
          Click on a building or search for a classroom to show floor plans and
          get directions
        </h6>
        <div id='info-div'>
          <div className='info-div-text' id='info-div-text'>
            <h4
              ref={nameElement}
              className='info-div-text'
              id='building-name'
            ></h4>
            <h6
              ref={addressElement}
              className='info-div-text'
              id='building-address'
            ></h6>
            <a
              href=''
              target='_blank'
              rel='noopener noreferrer'
              className='info-div-text'
              id='building-directions'
            >
              Get directions on Google Maps
            </a>
            <br></br>
            <div className='floor-dropdown' id='floor-dropdown'>
              <select
                id='floor-dropdown-select'
                onInput={selectFloorMap}
              ></select>
              <div id='floor-dropdown-field'></div>
              <img
                id='floor-arrow-circle'
                src='/arrowcircle.png'
                className='arrow-circle'
              ></img>
            </div>
          </div>
          <div id='info-line'></div>
          <img id='floor-map' onClick={showFullScreen}></img>
        </div>
      </div>
    </div>
  )
}
