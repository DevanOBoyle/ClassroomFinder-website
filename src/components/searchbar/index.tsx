import { statement } from "@babel/template"
import React, { useState, useEffect } from "react"
import getBuilding, { Building } from "../../utils/api"

const SearchBar = () => {
  /*
  const [buildings, setBuildings] = useState<Array<Building>>([])
  const [render, setRender] = useState<boolean>(false)
  
  
  useEffect(() => {
    getBuilding(setBuildings).then(() => setRender(true))
  }, [])

  if (render) {
    console.log(buildings)
  }
  
  return (
    <div className='search__container'>
      <input type='text' placeholder='Search...'></input>
    </div>
  )
  */

  const [buildings, setBuildings] = useState<Array<Building>>([])
  const [render, setRender] = useState<boolean>(false)

  const [filteredData, setFilteredData] = useState<Array<Building>>([])
  const [wordEntered, setWordEntered] = useState("")

  useEffect(() => {
    getBuilding(setBuildings).then(() => setRender(true))
  }, [])

  if (render) {
    console.log(buildings)
  }

  /*
  return (
    <div className='search__container'>
      <div className='searchInputs'>
        <input type='text' placeholder='Search...'></input>
      </div>
    </div>
  )
*/

  const handleFilter = (event: { target: { value: any } }) => {
    const searchWord = event.target.value
    setWordEntered(searchWord)
    const newFilter = buildings.filter(value => {
      return value.name.toLowerCase().includes(searchWord.toLowerCase())
    })

    console.log(newFilter)

    if (searchWord === "") {
      setFilteredData([])
    } else {
      setFilteredData(newFilter)
    }
  }
  const clearInput = () => {
    setFilteredData([])
    setWordEntered("")
  }

  return (
    <div className='search'>
      <div className='searchInputs'>
        <input
          type='text'
          placeholder='Search...'
          value={wordEntered}
          onChange={handleFilter}
        />
        <div className='searchIcon'></div>
      </div>

      {filteredData.length != 0 && (
        <div className='dataResult'>
          {filteredData.slice(0, 15).map(value => {
            return (
              <a className='dataItem' target='_blank'>
                {" "}
                <p>{value.name}</p>{" "}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SearchBar
