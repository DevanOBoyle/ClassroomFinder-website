import React, { useState, useEffect } from "react"
import getBuilding, { Building } from "../../utils/api"

const SearchBar = () => {
  const [buildings, setBuildings] = useState<Array<Building>>([])
  const [render, setRender] = useState<boolean>(false)

  useEffect(() => {
    getBuilding(setBuildings).then(() => setRender(true))
  }, [])

  if (render) {
    console.log(buildings)
  }

  return <div className='search__container'>{/* search bar here*/}</div>
}

export default SearchBar
