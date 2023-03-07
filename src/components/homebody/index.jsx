import React, { useState, useEffect, useRef } from "react"
import "../../stylesheets/textstyle.scss"
import "./index.scss"
import "../../../node_modules/ol/ol.css"
import getBuilding, { getClasses, getRooms } from "../../utils/api"

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
// import { transform } from "ol/proj"

import * as ics from "ics"

// Keep track of what is shown and not
var search = true
var info = false
var toggleRight = false
var buildingMarked = false
var currentBuilding = ""
var currentClass = ""

// Finding the floormaps
const floorMapBaseFolder = "/floormaps/"
var floorMapFolder
var floorMapHref
const googleMapsLinkBase = "https://www.google.com/maps/place/?q=place_id:"

const buildingsSource = new VectorSource({
  url: "/map.geojson",
  format: new GeoJSON(),
})

const quarters = ["fall2022", "winter2023", "spring2023"]

export default function Body() {
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [overlayLayer, setOverlayLayer] = useState()
  const [buildings, setBuildings] = useState([])
  const [rooms, setRooms] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [wordEntered, setWordEntered] = useState("")
  const [selectedQuarter, setQuarter] = useState(quarters[1])

  // eslint-disable-next-line
  const [classes, setClasses] = useState([])

  // References to the divs
  const mapElement = useRef()
  const mapPin = useRef()
  const nameElement = useRef()
  const addressElement = useRef()
  const floorPin = useRef()

  const mapRef = useRef()
  mapRef.current = map
  const featRef = useRef()
  featRef.current = featuresLayer
  const overlayRef = useRef()
  overlayRef.current = overlayLayer

  // Dummy values
  const meetingTime = "TuTh 03:20AM-04:55PM"

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
    /*
    const pointStyle = new Circle({
      fill: new Fill({
        color: [159, 212, 255, 1],
      }),
      radius: 7,
      stroke: strokeStyle,
    }) */

    const buildingsLayer = new VectorImageLayer({
      source: buildingsSource,
      visible: true,
      style: new Style({
        fill: fillStyle,
        stroke: strokeStyle,
        // image: pointStyle,
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
        maxZoom: 18,
        minZoom: 10,
      }),
    })
    // Handle map click
    initialMap.on("click", handleMapClick)

    setMap(initialMap)
    setFeaturesLayer(buildingsLayer)
    setOverlayLayer(initialOverlayLayer)

    getClasses(setClasses, selectedQuarter)
    getBuilding(setBuildings)
    getRooms(setRooms)
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
    document.getElementById("room-form").style.display = toggleRight
      ? "contents"
      : "none"

    toggleRight = !toggleRight
    currentBuilding = ""
    currentClass = ""
    setWordEntered("")
    setFilteredData("")
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

  function placeBuildingFromRoom() {
    if (currentBuilding == "") {
      alert("Please choose one of the buildings listed.")
    } else {
      document.getElementById("info-div-text-class").style.display = "none"
      placeOnMap(currentBuilding.place_id)
      searchButtonClick()
    }
  }

  function placeBuildingFromCode() {
    if (!currentClass) {
      alert(
        "Please choose one of the classes listed. " +
          "Class codes should be written in the format ABC123-01. " +
          "You can also search by the name of a class."
      )
    } else {
      document.getElementById("info-div-text-class").style.display = "flex"
      placeOnMap(currentBuilding.place_id)
      showPinOnFloorMap()
      searchButtonClick()
    }
  }

  const checkKey = event => {
    if (event.key === "Enter") {
      toggleRight ? placeBuildingFromCode() : placeBuildingFromRoom()
    } else if (event.key === "Tab") {
      event.preventDefault()
      if (filteredData.length > 0) {
        handleFilterClick(filteredData[0])
      }
    }
  }

  function openInfoWindow() {
    document.getElementById("info-div").style.display = buildingMarked
      ? "flex"
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

  // Change the info text to infoabout the building building
  function changeInfoText(building) {
    nameElement.current.innerHTML = building.get("name")
    addressElement.current.innerHTML = building.get("address")
    document.getElementById("building-directions").href =
      googleMapsLinkBase + building.getId()
  }

  // Show the correct floormaps
  function showFloorMaps(building) {
    // Change the options of the drop-down menu
    var selectCode = ""
    const floorFileNames = building.get("floors")
    if (floorFileNames.length > 0) {
      document.getElementById("floor-dropdown-select").value =
        floorFileNames[0][0]
      let i = 0
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
    document.getElementById("floormap-img").src = floorMapHref
  }

  // Show info at click
  function showFeatureInfo(e) {
    mapRef.current.forEachFeatureAtPixel(e.pixel, function (building) {
      buildingMarked = true
      document.getElementById("info-div-text-class").style.display = "none"
      // Place a marker
      overlayRef.current.setPosition(e.coordinate)
      // Set text
      changeInfoText(building)
      showFloorMaps(building)
      // Make sure the info window is open
      openInfoWindow()
    })
  }

  // Accepts coordinates as percentage from 0 to 100
  function showPinOnFloorMap(xcoord = 50, ycoord = 50) {
    console.log(document.getElementById("floormap-img").clientHeight)
    if (xcoord != -1 && ycoord != -1) {
      var yPercentageOfDiv =
        (ycoord / 100) * document.getElementById("floormap-img").clientHeight
      document
        .getElementById("floormap-pin")
        .setAttribute(
          "style",
          "left: " +
            xcoord.toString() +
            "%; top: " +
            yPercentageOfDiv.toString() +
            "px; display: block;"
        )
    }
  }

  // Search filter handler
  function handleFilter(event, arr) {
    console.log(event)
    console.log(arr)
    const searchWord = event.target.value
    setWordEntered(searchWord)
    const newFilter = arr.filter(value => {
      if (arr == rooms) {
        let concatStr = value.name.toLowerCase()
        if (value.room_number) {
          concatStr = concatStr + " " + value.room_number.toLowerCase()
        }
        if (concatStr.includes(searchWord.toLowerCase())) {
          return true
        }
        for (let i = 0; i < value.other_names.length; i++) {
          concatStr = value.other_names[i].toLowerCase()
          if (value.room_number) {
            concatStr = concatStr + " " + value.room_number.toLowerCase()
          }
          if (concatStr.includes(searchWord.toLowerCase())) {
            return true
          }
        }
        return false
      } else {
        let concatStr = value.code.toLowerCase()
        if (value.name) {
          concatStr = concatStr + " " + value.name.toLowerCase()
        }
        return concatStr.includes(searchWord.toLowerCase())
      }
    })

    if (searchWord === "") {
      setFilteredData([])
    } else {
      setFilteredData(newFilter)
    }
  }

  const placeOnMap = placeId => {
    const building = buildingsSource.getFeatureById(placeId)
    buildingMarked = true
    const cord = building.get("geometry").geometries_[0].flatCoordinates
    // Place a marker
    overlayRef.current.setPosition([cord[0], cord[1]])
    zoomAndCenter(cord)
    changeInfoText(building)
    showFloorMaps(building)
    openInfoWindow()
  }

  // Center and zoom the map
  function zoomAndCenter(coordinates) {
    mapRef.current.setView(
      new View({
        center: coordinates,
        zoom: 16,
        maxZoom: 18,
        minZoom: 10,
      })
    )
  }

  /* 
  Handler for clicking on drop down element on search
  param: value -> contains either room or class object data
  global var change: currentBuilding, currentRoomNum (To Be Added) 
  */

  const handleFilterClick = value => {
    if (value.code) {
      let room = null
      setWordEntered(value.code + " " + value.name)
      for (let i = 0; i < rooms.length; i++) {
        if (
          value.meeting_place
            .toLowerCase()
            .includes(rooms[i].name.toLowerCase())
        ) {
          currentBuilding = buildings[i]
        } else {
          for (let j = 0; j < rooms[i].other_names.length; j++) {
            if (
              value.meeting_place
                .toLowerCase()
                .includes(rooms[i].other_names[j].toLowerCase())
            ) {
              room = rooms[i]
              currentClass = rooms[i]
            }
          }
        }
        if (room) {
          for (let i = 0; i < buildings.length; i++) {
            if (buildings[i].name === room.name) {
              currentBuilding = buildings[i]
            }
          }
        }
      }
    } else if (value.room_number) {
      setWordEntered(value.name + " " + value.room_number)
      for (let i = 0; i < buildings.length; i++) {
        if (buildings[i].name === value.name) {
          currentBuilding = buildings[i]
        }
      }
    }
    document.getElementById("classroom-input").focus()
  }

  // Map click handler
  const handleMapClick = event => {
    showFeatureInfo(event)
  }

  function selectFloorMap() {
    // console.log(document.getElementById("floor-dropdownSelect").value)
    floorMapHref =
      floorMapFolder + document.getElementById("floor-dropdown-select").value
    document.getElementById("floormap-img").src = floorMapHref
  }

  function showFullScreen() {
    let image = document.getElementById("floormap-img")
    if (!document.fullscreenElement) {
      image?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  function updateQuarter(value) {
    getClasses(setClasses, value)
    setQuarter(value)
  }

  async function handleDownloadedEvent(calendarEvent) {
    const filename = "class.code" + ".ics"
    const file = await new Promise((resolve, reject) => {
      ics.createEvent(calendarEvent, (error, value) => {
        if (error) {
          reject(error)
        }

        resolve(new File([value], filename, { type: "plain/text" }))
      })
    })
    const url = URL.createObjectURL(file)

    // trying to assign the file URL to a window could cause cross-site
    // issues so this is a workaround using HTML5
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename

    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    URL.revokeObjectURL(url)
  }

  function getDays(meetingDays) {
    // Form: "MO,WE,FR"
    var weekDays = ""
    if (meetingDays.match("M")) weekDays += "MO,"
    if (meetingDays.match("Th")) {
      if (meetingDays.match("Tu")) weekDays += "TU,"
    } else if (meetingDays.match("T")) weekDays += "TU,"
    if (meetingDays.match("W")) weekDays += "WE,"
    if (meetingDays.match("Th")) weekDays += "TH,"
    if (meetingDays.match("F")) weekDays += "F,"
    return weekDays.slice(0, -1)
  }

  function getHr(USTime) {
    return USTime.charAt(5) == "P"
      ? +USTime.substr(0, 2) + 12
      : +USTime.substr(0, 2)
  }

  function getMin(USTime) {
    return +USTime.substr(3, 2)
  }

  function downloadCalendarEvent() {
    var meetingTimeArray = meetingTime.split(/\s|-/)
    console.log(meetingTime)
    console.log(meetingTimeArray)
    const startHr = getHr(meetingTimeArray[1])
    const startMin = getMin(meetingTimeArray[1])
    const endHr = getHr(meetingTimeArray[2])
    const endMin = getMin(meetingTimeArray[2])
    console.log(startHr)
    console.log(startMin)
    console.log(endHr)
    console.log(endMin)
    // create calendar event
    const calendarEvent = {
      // Jan 9th 2023
      start: [2023, 1, 9, startHr, startMin],
      end: [2023, 1, 9, endHr, endMin],
      // startInputType: "utc-8", // Solve time zones
      // Repeated every MWF until March 25th
      recurrenceRule:
        "FREQ=WEEKLY;BYDAY=" +
        getDays(meetingTimeArray[0]) +
        ";INTERVAL=1;UNTIL=20230325T000000Z;",
      title: "class.code" + " " + "class.name",
      description:
        "Instructor: " + "class.instructor" + "\nMode: " + "class.mode",
      location: "class.meeting_place",
      // url: "https://www.classroomfinder.ucsc.edu/",
      // geo: { lat: 40.0095, lon: 105.2669 },
      busyStatus: "BUSY",
      organizer: { name: "UCSC" },
    }
    handleDownloadedEvent(calendarEvent)
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
                  placeholder='e.g. "R Carson 250"'
                  maxLength={60}
                  value={wordEntered}
                  onChange={event => handleFilter(event, rooms)}
                  onKeyDown={checkKey}
                  //onChange={handleFilter(buildings)}
                  required
                />
                <div className='search-bar-field'></div>
                <img
                  className='search-bar-button'
                  onClick={placeBuildingFromRoom}
                  id='classroom-submit-button'
                  src='/arrowcircle.png'
                ></img>
              </div>
              <div>
                {filteredData.length != 0 && (
                  <div id='data-result'>
                    {filteredData.slice(0, 15).map((value, key) => {
                      return (
                        <a
                          key={key}
                          onClick={() => handleFilterClick(value)}
                          className='dataItem'
                          target='_blank'
                        >
                          {" "}
                          <p>{value.name + " " + value.room_number}</p>{" "}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <div id='class-form'>
              <div id='quarter-dropdown'>
                <select
                  id='quarter-dropdown-select'
                  value={selectedQuarter}
                  onChange={e => updateQuarter(e.target.value)}
                >
                  {quarters.map(value => (
                    <option value={value} key={value}>
                      {value}
                    </option>
                  ))}
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
                  value={wordEntered}
                  onChange={event => handleFilter(event, classes)}
                  onKeyDown={checkKey}
                  pattern='^[a-zA-Z]{2,4}\d{2,4}[a-zA-Z]{0,1}-\d{2}$'
                  required
                />
                <div className='search-bar-field'></div>
                <img
                  className='search-bar-button'
                  onClick={placeBuildingFromCode}
                  id='classcode-submit-button'
                  src='/arrowcircle.png'
                ></img>
                {filteredData.length != 0 && (
                  <div id='data-class-result'>
                    {filteredData.slice(0, 15).map((value, key) => {
                      return (
                        <a
                          key={key}
                          onClick={() => handleFilterClick(value)}
                          className='dataClassItem'
                          target='_blank'
                        >
                          {" "}
                          <p>{value.code + " " + value.name}</p>{" "}
                        </a>
                      )
                    })}
                  </div>
                )}
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
            <div id='info-div-text-class'>
              <button id='calendar-button' onClick={downloadCalendarEvent}>
                Click here to download calendar event
              </button>
            </div>
          </div>
          <div id='info-line'></div>
          <div id='floormap' onClick={showFullScreen}>
            <img id='floormap-img'></img>
            <img
              ref={floorPin}
              id='floormap-pin'
              src={
                "http://icons.iconarchive.com/icons/icons-land" +
                "/vista-map-markers/256/Map-Marker-Ball-Pink-icon.png"
              }
            ></img>
          </div>
        </div>
      </div>
    </div>
  )
}
