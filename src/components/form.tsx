import React from "react"
import ReactDOM from "react-dom"
import { useForm, SubmitHandler } from "react-hook-form"
import "../stylesheets/form.scss"

enum inputType {
  room = "room",
  class = "class",
}

interface IFormInput {
  input: string
  inputType: inputType
}

export default function Form() {
  const { register, handleSubmit } = useForm<IFormInput>()
  const onSubmit: SubmitHandler<IFormInput> = data => console.log(data)

  return (
    <div id='searchBlock'>
      <h1>UCSC ClassroomFinder</h1>
      <div id='search_box'>
        {/* Validating input */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Search by: </label>
          <select {...register("inputType", { required: true })} id='inputType'>
            <option value='room'>Classroom</option>
            <option value='class'>Class code</option>
          </select>
          <input
            {...register("input", { required: true, maxLength: 50 })}
            id='input'
          />
          <input type='submit' id='submit' value='Search'></input>
        </form>
      </div>
    </div>
  )
}
