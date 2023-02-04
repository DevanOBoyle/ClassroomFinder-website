import React from "react"
import "../stylesheets/form.scss"

export default function Form() {
  const setInputType = value => {
    if (value === 1) {
      document.getElementById("room-div").style.display = "block"
      document.getElementById("class-div").style.display = "none"
    } else {
      document.getElementById("room-div").style.display = "none"
      document.getElementById("class-div").style.display = "block"
    }
  }

  const sendRoom = event => {
    // Preventing the page from reloading
    event.preventDefault()

    // console.log(newRoom)
    console.log(event)
  }

  const sendClass = event => {
    // Preventing the page from reloading
    event.preventDefault()

    // console.log(newClass)
    // console.log(newQuarter)
    console.log(event)
  }

  return (
    <div id='search-block'>
      <h1>UCSC ClassroomFinder</h1>
      <div id='search_box'>
        <a>Search by: </a>
        <div className='tabs'>
          <button
            onClick={() => setInputType(1)}
            className='tab'
            id='tab1'
            onFocus={true}
          >
            ROOM
          </button>
          <button onClick={() => setInputType(2)} className='tab' id='tab2'>
            CLASS CODE
          </button>

          <div id='room-div'>
            <form id='roomForm' onSubmit={sendRoom}>
              <input
                id='classRoom'
                className='input'
                placeholder='e.g. "R Carson 205"'
                maxLength={60}
                required
              />
              <input type='submit' id='submit' value='SEARCH'></input>
            </form>
          </div>
          <div id='class-div'>
            <form id='classForm' onSubmit={sendClass}>
              <label>Quarter: </label>
              <select id='quarter' className='drop-down' defaultValue={"w23"}>
                <option value='f22'>Fall 22</option>
                <option value='w23'>Winter 23</option>
                <option value='s23'>Spring 23</option>
              </select>
              <input
                id='classCode'
                className='input'
                placeholder='e.g. "CSE123-01"'
                pattern='^[a-zA-Z]{2,4}\d{2,4}[a-zA-Z]{0,1}-\d{2}$'
                required
              />
              <input type='submit' id='submit' value='SEARCH'></input>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
