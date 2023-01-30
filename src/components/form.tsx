import React, { useState } from "react"
import ReactDOM from "react-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import {
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
} from "mdb-react-ui-kit"
import "../stylesheets/form.scss"
import "mdb-react-ui-kit/dist/css/mdb.min.css"

export default function Form() {
  const [basicActive, searchBlock1] = useState("room")

  const setInputType = (value: string) => {
    if (value === basicActive) {
      return
    }
    searchBlock1(value)
  }

  const sendRoom = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault()

    // console.log(newRoom)
    console.log(event)
  }

  const sendClass = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault()

    // console.log(newClass)
    // console.log(newQuarter)
    console.log(event)
  }

  return (
    <div id='searchBlock'>
      <h1>UCSC ClassroomFinder</h1>
      <div id='search_box'>
        <a>Search by: </a>
        <MDBTabs pills justify className='tabs'>
          <MDBTabsItem>
            <MDBTabsLink
              onClick={() => setInputType("room")}
              active={basicActive === "room"}
              className='tab'
            >
              Classroom
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink
              onClick={() => setInputType("class")}
              active={basicActive === "class"}
              className='tab'
            >
              Class code
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>

        <MDBTabsContent>
          <MDBTabsPane show={basicActive === "room"}>
            <form id='roomForm' onSubmit={sendRoom}>
              <input id='classRoom' className='input' maxLength={60} required />
              <input type='submit' id='submit' value='SEARCH'></input>
            </form>
          </MDBTabsPane>
          <MDBTabsPane show={basicActive === "class"}>
            <form id='classForm' onSubmit={sendClass}>
              <label>Quarter: </label>
              <select id='quarter' className='drop-down' defaultValue={"w23"}>
                <option value='f22'>Fall 22</option>
                <option value='w23'>Winter 23</option>
                <option value='s23'>Spring 23</option>
              </select>
              <input id='classCode' className='input' maxLength={60} required />
              <input type='submit' id='submit' value='SEARCH'></input>
            </form>
          </MDBTabsPane>
        </MDBTabsContent>
      </div>
    </div>
  )
}
