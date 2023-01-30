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
// import "mdb-react-ui-kit/dist/css/mdb.min.css"
import "../stylesheets/form.scss"
/*
interface IFormInput {
  classRoom: string | null
  quarter: string | null
  classCode: string | null
} */

export default function Form() {
  /*
  const { register, handleSubmit } = useForm<IFormInput>()
  const onSubmit: SubmitHandler<IFormInput> = data => console.log(data) */

  // const [newRoom, setRoom] = useState("")
  // const [newClass, setClass] = useState("")
  // const [newQuarter, setQuarter] = useState("")

  const [basicActive, searchBlock1] = useState("room")

  const setInputType = (value: string) => {
    if (value === basicActive) {
      return
    }
    // ;(document.getElementById("roomForm") as HTMLFormElement).reset()
    // ;(document.getElementById("classForm") as HTMLFormElement).reset()
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
            {/* Validating input */}
            <form id='roomForm' onSubmit={sendRoom}>
              <input
                // value={newRoom}
                // onChange={e => setRoom(e.target.value)}
                // {...register("classRoom",
                // { required: false, maxLength: 60 })}
                id='classRoom'
                className='input'
                required
              />
              <input type='submit' id='submit' value='SEARCH'></input>
            </form>
          </MDBTabsPane>
          <MDBTabsPane show={basicActive === "class"}>
            <form id='classForm' onSubmit={sendClass}>
              <label>Quarter: </label>
              <select
                // value={newQuarter}
                // onChange={e => setQuarter(e.target.value)}
                // {...register("quarter", { required: false })}
                id='quarter'
                className='drop-down'
                defaultValue={"w23"}
              >
                <option value='f22'>Fall 22</option>
                <option value='w23'>Winter 23</option>
                <option value='s23'>Spring 23</option>
              </select>
              <input
                // value={newClass}
                // onChange={e => setClass(e.target.value)}
                // {...register("classCode",
                // { required: false, maxLength: 60 })}
                id='classCode'
                className='input'
                required
              />
              <input type='submit' id='submit' value='SEARCH'></input>
            </form>
          </MDBTabsPane>
        </MDBTabsContent>
      </div>
    </div>
  )
}
