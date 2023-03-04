import axios from "axios"
import { Dispatch } from "react"

const getBuilding = async (setBuilding: Dispatch<any>) => {
  try {
    const getBuildingAxiosRequest = {
      method: "get",
      url: `${process.env.REACT_APP_ENDPOINT_URL}/buildings`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.REACT_APP_CORS_ORIGIN || "",
      },
    }
    const res = await axios(getBuildingAxiosRequest) // Something is wrong here
    const buildingData = res.data.buildings
    console.log(buildingData)

    setBuilding(buildingData)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError: any = err
      console.log(axiosError.response.data.error)
    }
  }
}

export const getClasses = async (setClasses: Dispatch<any>, term: string) => {
  try {
    console.log(term)
    const getBuildingAxiosRequest = {
      method: "get",
      url: `${process.env.REACT_APP_ENDPOINT_URL}/classes/${term}`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.REACT_APP_CORS_ORIGIN || "",
      },
    }
    const res = await axios(getBuildingAxiosRequest)
    const classData = res.data.classes

    console.log(classData)

    setClasses(classData)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError: any = err
      console.log(axiosError.response.data.error)
    }
  }
}

export const getRooms = async (setRooms: Dispatch<any>) => {
  try {
    const getBuildingAxiosRequest = {
      method: "get",
      url: `${process.env.REACT_APP_ENDPOINT_URL}/rooms`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.REACT_APP_CORS_ORIGIN || "",
      },
    }
    const res = await axios(getBuildingAxiosRequest)
    const roomData = res.data.rooms

    console.log(roomData)

    setRooms(roomData)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError: any = err
      console.log(axiosError.response.data.error)
    }
  }
}

export default getBuilding
