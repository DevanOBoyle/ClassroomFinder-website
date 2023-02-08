import axios from "axios"
import { Dispatch } from "react"

export interface Building {
  name: string
}

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
    const res = await axios(getBuildingAxiosRequest)
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

export default getBuilding