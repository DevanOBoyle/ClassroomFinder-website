import React, { useState, useEffect } from "react"
import "./index.scss"
import SearchBar from "./../Components/SearchBar"

const Home: React.FC = () => {
  const [storedData, setStoredData] = useState([])
  
  useEffect(() => {
      fetch(`https://jsonplaceholder.typicode.com/users`)
        .then(res => res.json())
        .then(res => setStoredData(res))
  }, [])

  return(
    <div>
      <div className='.home__container'>Classroom Finder</div>
      <div className='App'>
        <SearchBar placeholder='Enter a Book Name...' data={storedData}/>
      </div>
    </div>
  );
}

export default Home
