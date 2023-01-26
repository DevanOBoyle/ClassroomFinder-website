import React from "react"
import ReactDOM from "react-dom"
import { useForm, SubmitHandler } from "react-hook-form"

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
    // Validating input
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Search by: </label>
      <select {...register("inputType", { required: true })}>
        <option value='room'>Classroom</option>
        <option value='class'>Class code</option>
      </select>
      <label>Name: </label>
      <input {...register("input", { required: true, maxLength: 50 })} />
      <input type='submit' />
    </form>
  )
}
