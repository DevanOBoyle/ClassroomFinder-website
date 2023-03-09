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
// import { NULL } from "sass"

// Keep track of what is shown and not
var search = true
var info = false
var toggleRight = false
var buildingMarked = false
var currentBuilding = ""
var currentClass = ""
var currentRoomNr = ""

// Finding the floormaps
const floorMapBaseFolder = "/floormaps/"
var floorMapFolder
var floorMapHref
const googleMapsLinkBase = "https://www.google.com/maps/place/?q=place_id:"

const buildingsSource = new VectorSource({
  url: "/map.geojson",
  format: new GeoJSON(),
})

const fall2022 = {
  name: "Fall 2022",
  quarter: "fall2022",
  startDate: new Date(2022, 8, 22), // Thursday
  endDate: new Date(2022, 11, 2),
}

const winter2023 = {
  name: "Winter 2023",
  quarter: "winter2023",
  startDate: new Date(2023, 0, 9),
  endDate: new Date(2023, 2, 17),
}

const spring2023 = {
  name: "Spring 2023",
  quarter: "spring2023",
  startDate: new Date(2023, 3, 3),
  endDate: new Date(2023, 5, 9),
}
const quarters = [fall2022, winter2023, spring2023]

var meetingTimeArray
var weekDaysString = ""
var weekDaysCount = [0, 0, 0, 0, 0, 0, 0]
var lecturesTBD = false

export default function Body() {
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [overlayLayer, setOverlayLayer] = useState()
  const [buildings, setBuildings] = useState([])
  const [rooms, setRooms] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [wordEntered, setWordEntered] = useState("")
  const [selectedQuarter, setQuarter] = useState(quarters[1].quarter)

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
        center: [-13587600, 4438600],
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
    console.log(selectedQuarter)
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
    currentRoomNr = ""
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
      placeOnMap(currentBuilding.place_id)
      showBuildingInfo()
      openInfoWindow()
      searchButtonClick()
    }
  }

  // Place the building on the map and show info about the class
  function placeBuildingFromCode() {
    if (currentClass == "") {
      alert(
        "Please choose one of the classes listed. " +
          "Class codes should be written in the format ABC123-01. " +
          "You can also search by the name of a class."
      )
    } else {
      updateClassVariables()
      if (currentBuilding) placeOnMap(currentBuilding.place_id)
      else buildingMarked = true
      changeInfoTextForClass()
      showClassInfo()
      showPinOnFloorMap()
      openInfoWindow()
      searchButtonClick()
    }
  }

  // Checks which key that was pushed
  // Searchs on enter, autofills on tab
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

  // Change the info text to info about the building building
  function changeInfoTextforBuilding(building) {
    nameElement.current.innerHTML = building.get("name")
    addressElement.current.innerHTML = building.get("address")
    document.getElementById("building-directions").href =
      googleMapsLinkBase + building.getId()
  }

  function updateClassVariables() {
    meetingTimeArray = currentClass.meeting_time.split(/\s|-/)
    let weekDays = updateWeekDays(meetingTimeArray[0])
    console.log(weekDays)
    lecturesTBD = weekDays == ""
  }

  // Change the info text for the class
  function changeInfoTextForClass() {
    document.getElementById("class-name").innerHTML =
      currentClass.code + " " + currentClass.name
    document.getElementById("class-instructor").innerHTML =
      "Instructor: " + currentClass.instructor
    document.getElementById("class-mode").innerHTML =
      "Mode: " + currentClass.mode
    document.getElementById("class-time").innerHTML =
      "Lecture time: " + currentClass.meeting_time
    document.getElementById("class-place").innerHTML =
      "Place: " + currentClass.meeting_place
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

  function showBuildingInfo() {
    const classInfo = document.getElementsByClassName("class-info")
    for (let i = 0; i < classInfo.length; i++)
      classInfo[i].style.display = "none"
    const buildingInfo = document.getElementsByClassName("building-info")
    for (let i = 0; i < buildingInfo.length; i++)
      buildingInfo[i].style.display = "block"
    document.getElementById("floormap").style.display = "block"
    document.getElementById("info-line").style.display = "flex"
  }

  function showClassInfo() {
    const buildingInfo = document.getElementsByClassName("building-info")
    for (let i = 0; i < buildingInfo.length; i++)
      buildingInfo[i].style.display = "none"
    const classInfo = document.getElementsByClassName("class-info")
    for (let i = 0; i < classInfo.length; i++)
      classInfo[i].style.display = "block"
    if (lecturesTBD) {
      document.getElementById("calendar-button").style.display = "none"
      document.getElementById("floormap").style.display = "none"
      document.getElementById("info-line").style.display = "none"
    } else {
      document.getElementById("floormap").style.display = "flex"
      document.getElementById("info-line").style.display = "flex"
    }
  }

  // Show info at click
  function showFeatureInfo(e) {
    mapRef.current.forEachFeatureAtPixel(e.pixel, function (building) {
      buildingMarked = true
      // Place a marker
      overlayRef.current.setPosition(e.coordinate)
      // Set text
      changeInfoTextforBuilding(building)
      showBuildingInfo()
      showFloorMaps(building)
      // Make sure the info window is open
      openInfoWindow()
    })
  }

  // Accepts coordinates as percentage from 0 to 100
  function showPinOnFloorMap(xcoord = -1, ycoord = -1) {
    // console.log(document.getElementById("floormap-img").clientHeight)
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
        return concatStr.includes(searchWord.toLowerCase())
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

  // Place a pin on the map for the building with place_id placeId
  const placeOnMap = placeId => {
    if (lecturesTBD) return
    try {
      const building = buildingsSource.getFeatureById(placeId)
      buildingMarked = true
      const cord = building.get("geometry").geometries_[0].flatCoordinates
      // Place a marker
      overlayRef.current.setPosition([cord[0], cord[1]])
      zoomAndCenter(cord)
      changeInfoTextforBuilding(building)
      showFloorMaps(building)
    } catch (e) {
      console.log(e)
      alert("Oops! Seems like the building is missing")
    }
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
    console.log(value)
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
              currentRoomNr = rooms[i]
              console.log(currentRoomNr)
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
        currentClass = value
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
    floorMapHref =
      floorMapFolder + document.getElementById("floor-dropdown-select").value
    document.getElementById("floormap-img").src = floorMapHref
  }

  // Shows the floormap in fullscreen
  function showFullScreen() {
    let image = document.getElementById("floormap-img")
    if (!document.fullscreenElement) {
      image?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Sets the quarter to value
  function updateQuarter(value) {
    setQuarter(value)
    getClasses(setClasses, value)
  }

  // Creating an ics file from the calendar event calendarEvent
  // Credit to https://www.npmjs.com/package/ics
  async function handleDownloadedEvent(calendarEvent) {
    const filename = currentClass.code + ".ics"
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

  // Identifies the right quarter object from the quarter string
  function getQuarterObjectIndex(quarterString = selectedQuarter) {
    console.log(quarterString)
    const quarter = element => element.quarter == quarterString
    return quarters.findIndex(quarter)
  }

  // Identifies the week days from the string meetingDays
  // on the form "TuTh10:30PM-12:30PM"
  function updateWeekDays(meetingDays) {
    // Form: "MO,WE,FR"
    weekDaysString = ""
    if (meetingDays.match("M")) {
      weekDaysString += "MO,"
      weekDaysCount[1] = 1
    }
    if (meetingDays.match("Th")) {
      if (meetingDays.match("Tu")) {
        weekDaysString += "TU,"
        weekDaysCount[2] = 1
      }
    } else if (meetingDays.match("T")) {
      weekDaysString += "TU,"
      weekDaysCount[2] = 1
    }
    if (meetingDays.match("W")) {
      weekDaysString += "WE,"
      weekDaysCount[3] = 1
    }
    if (meetingDays.match("Th")) {
      weekDaysString += "TH,"
      weekDaysCount[4] = 1
    }
    if (meetingDays.match("F")) {
      weekDaysString += "FR,"
      weekDaysCount[5] = 1
    }
    if (meetingDays.match("Sa")) {
      weekDaysString += "SA,"
      weekDaysCount[6] = 1
    }
    if (meetingDays.match("Su")) {
      weekDaysString += "SU,"
      weekDaysCount[0] = 1
    }
    if (weekDaysString.length == 0) return ""
    return weekDaysString.slice(0, -1)
  }

  function getDateDiff(firstDayOfQuarter) {
    let day = firstDayOfQuarter
    do {
      if (weekDaysCount[day]) return (day - firstDayOfQuarter) % 7
      day = day == 6 ? 0 : day + 1
    } while (day != firstDayOfQuarter)
    return 0
  }

  Date.prototype.addDays = function (diff) {
    var newDate = new Date(this.valueOf())
    newDate.setDate(newDate.getDate() + diff)
    return newDate
  }

  function getDateOfFirstEvent(firstDateOfQuarter) {
    console.log(firstDateOfQuarter)
    var firstDay = firstDateOfQuarter.getDay()
    return firstDateOfQuarter.addDays(getDateDiff(firstDay))
  }

  // Identifies the minute part from the string USTime, on the form "10:30PM"
  function getHr(USTime) {
    return USTime.charAt(5) == "P"
      ? +USTime.substr(0, 2) + 12
      : +USTime.substr(0, 2)
    // Does it work if the time is between 00:00 and 01:00?
  }

  // Identifies the hour part from the string USTime, on the form "10:30PM"
  // and converts it to 24hr time
  function getMin(USTime) {
    return +USTime.substr(3, 2)
  }

  // Creates and downloads a calendar event for the meetings of currentClass
  function downloadCalendarEvent() {
    const startHr = getHr(meetingTimeArray[1])
    const startMin = getMin(meetingTimeArray[1])
    const endHr = getHr(meetingTimeArray[2])
    const endMin = getMin(meetingTimeArray[2])
    const qrtrObj = quarters[getQuarterObjectIndex()]
    const dateOfFirstLecture = getDateOfFirstEvent(qrtrObj.startDate)
    // create calendar event
    const calendarEvent = {
      // Jan 9th 2023
      start: [
        dateOfFirstLecture.getFullYear(),
        dateOfFirstLecture.getMonth() + 1,
        dateOfFirstLecture.getDate(),
        startHr,
        startMin,
      ],
      end: [
        dateOfFirstLecture.getFullYear(),
        dateOfFirstLecture.getMonth() + 1,
        dateOfFirstLecture.getDate(),
        endHr,
        endMin,
      ],
      // startInputType: "utc-8", // Solve time zones
      recurrenceRule:
        "FREQ=WEEKLY;BYDAY=" +
        weekDaysString +
        ";INTERVAL=1;UNTIL=20230325T000000Z;",
      title: currentClass.code + " " + currentClass.name,
      description:
        "Instructor: " +
        currentClass.instructor +
        "\nMode: " +
        currentClass.mode,
      location: currentClass.meeting_place,
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
                  placeholder='e.g. "R Carson 205"'
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
                    <option value={value.quarter} key={value.name}>
                      {value.name}
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
              className='building-info'
              id='building-name'
            ></h4>
            <h4 className='class-info' id='class-name'></h4>
            <button
              id='calendar-button'
              className='class-info'
              onClick={downloadCalendarEvent}
            >
              Click here to download calendar event
            </button>
            <h6 className='class-info' id='class-instructor'></h6>
            <h6 className='class-info' id='class-time'></h6>
            <h6 className='class-info' id='class-place'></h6>
            <h6 className='class-info' id='class-mode'></h6>
            <h6
              ref={addressElement}
              className='building-info'
              id='building-address'
            ></h6>
            <a
              href=''
              target='_blank'
              rel='noopener noreferrer'
              className='building-info class-info'
              id='building-directions'
            >
              Get directions on Google Maps
            </a>
          </div>
          <div id='info-line'></div>
          <div id='floormap'>
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
            <img id='floormap-img' onClick={showFullScreen}></img>
            <img
              ref={floorPin}
              id='floormap-pin'
              src={
                "http://icons.iconarchive.com/icons/icons-land" +
                "/vista-map-markers/256/Map-Marker-Ball-Pink-icon.png"
              }
            ></img>
            <p>Click on the floormap to view in fullscreen.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
