import React from "react"
import "./index.scss"
import MapWrapper from "../components/map/index"

const Home: React.FC = () => {
  return (
    <div className='home__container'>
      <div className='home__container--search'></div>
      <div className='home__container--map'>
        <MapWrapper />
      </div>
      <div className='home__container--info'></div>
      <div className='home__container--footer'></div>
    </div>
  )
}

export default Home
