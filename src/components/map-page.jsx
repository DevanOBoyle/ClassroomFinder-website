import React, { useState, useEffect, useRef } from "react"
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
    document.getElementById("slide").style.left = toggleRight ? "6px" : "auto"
    document.getElementById("slide").style.right = toggleRight ? "auto" : "6px"
    toggleRight = !toggleRight
  }

  function searchButtonClick() {
    // Change the size of the search window and show/hide content
    if (search) {
      // Hide content
      document.getElementById("search-block").style.display = "none"
      document.getElementById("search-text").style.display = "block"
      document.getElementById("search-arrow").style.transform = "rotate(45deg)"
      document.getElementById("search-arrow").style.bottom = "20px"
    } else {
      // Show content
      document.getElementById("search-block").style.display = "contents"
      document.getElementById("search-text").style.display = "none"
      document.getElementById("search-arrow").style.transform =
        "rotate(-135deg)"
      document.getElementById("search-arrow").style.bottom = "0"
    }
    search = !search
  }

  function openInfoWindow() {
    document.getElementById("info-block").style.display = buildingMarked
      ? "block"
      : "none"
    document.getElementById("info-nobuilding").style.display = buildingMarked
      ? "none"
      : "block"
    document.getElementById("info-text").style.display = "none"
    document.getElementById("info-arrow").style.transform = "rotate(45deg)"
    document.getElementById("info-arrow").style.top = "0"
    info = true
  }
  function closeInfoWindow() {
    document.getElementById("info-block").style.display = "none"
    document.getElementById("info-nobuilding").style.display = "none"
    document.getElementById("info-text").style.display = "block"
    document.getElementById("info-arrow").style.transform = "rotate(-135deg)"
    document.getElementById("info-arrow").style.top = "20px"
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
      document.getElementById("floor").innerHTML = selectCode
      // Show the right floor plan image
      floorMapFolder = floorMapBaseFolder + building.getId() + "/"
      floorMapHref = floorMapFolder + document.getElementById("floor").value
      document.getElementById("floormap").src = floorMapHref
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

  // Map click handler
  const handleMapClick = event => {
    showFeatureInfo(event)
  }

  function selectFloorMap() {
    // console.log(document.getElementById("floor").value)
    floorMapHref = floorMapFolder + document.getElementById("floor").value
    document.getElementById("floormap").src = floorMapHref
  }

  return (
    <div className='main'>
      <div className='search'>
        <div id='search-block'>
          <div className='search-toggle' onClick={toggleClick}>
            <div className='search-toggle-field'></div>
            <div className='search-toggle-slide' id='slide'></div>
            <span id='search-toggle-text-room'>Room</span>
            <span id='search-toggle-text-class'>Class code</span>
          </div>
          <div className='input-div'>
            <div id='room-form'>
              <div className='search-bar'>
                <input
                  id='class-room'
                  className='input'
                  placeholder='e.g. "R Carson 205"'
                  maxLength={60}
                  value={wordEntered}
                  onChange={handleFilter}
                  required
                />
                <div className='search-bar-field'></div>
                <div className='search-bar-circle'>
                  <input type='submit' id='submit-room' value=''></input>
                  <div className='search-bar-circle-blue'></div>
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
              <div className='search-dropdown'>
                <select
                  id='quarter'
                  className='search-dropdown-select'
                  defaultValue={"w23"}
                >
                  <option value='f22'>Fall 22</option>
                  <option value='w23'>Winter 23</option>
                  <option value='s23'>Spring 23</option>
                </select>
                <div className='search-dropdown-field'></div>
                <div className='dropdown-circle'></div>
                <div className='dropdown-arrow down'></div>
              </div>
              <div className='search-bar'>
                <input
                  id='class-code'
                  className='input'
                  placeholder='e.g. "CSE123-01"'
                  pattern='^[a-zA-Z]{2,4}\d{2,4}[a-zA-Z]{0,1}-\d{2}$'
                  required
                />
                <div className='search-bar-field'></div>
                <div className='search-bar-circle'>
                  <input type='submit' id='submit-code' value=''></input>
                  <div className='search-bar-circle-blue'></div>
                </div>
                <div className='search-bar-arrow right'></div>
              </div>
            </div>
          </div>
        </div>
        <span id='search-text'>Search</span>
        <div
          id='search-arrow'
          className='arrow up'
          onClick={searchButtonClick}
        ></div>
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
      <div className='info'>
        <span id='info-text'>Info</span>
        <div
          id='info-arrow'
          className='arrow up'
          onClick={infoButtonClick}
        ></div>
        <p id='info-nobuilding'>
          Click on a building or search for a classroom to show floor plans and
          get directions
        </p>
        <div id='info-block'>
          <div
            ref={textElement}
            className='info-block-text'
            id='info-block-text'
          >
            <h3
              ref={nameElement}
              className='info-block-text'
              id='building-name'
            ></h3>
            <br></br>
            <p
              ref={addressElement}
              className='info-block-text'
              id='building-address'
            ></p>
            <br></br>
            <span
              ref={linkElement}
              className='info-block-text'
              id='building-directions'
            ></span>
            <br></br>
            <div className='floor-dropdown' id='floor-dropdown'>
              <select
                id='floor'
                className='floor-dropdown-select'
                onInput={selectFloorMap}
              ></select>
              <div className='floor-dropdown-field'></div>
              <div className='dropdown-circle'></div>
              <div className='dropdown-arrow down'></div>
            </div>
          </div>
          <div className='info-line'></div>
          <img className='info-floormap' id='floormap'></img>
        </div>
      </div>
    </div>
  )
}