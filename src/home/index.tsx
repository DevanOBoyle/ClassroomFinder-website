import React from "react"
import "./index.scss"
import Sammy from "../assets/sammybiking.png"

const Home: React.FC = () => {
  return (
    <div className='home__container'>
      <div className='home__container--title'>ClassroomFinder</div>
      <div className='home__container--text'>
        Find your classes at UC Santa Cruz with ease!
      </div>
      <div className='home__container--search_box'>
        {/* insert map component */}
      </div>
      <div className='home__container--names'>
        <div>Brought to you by</div>
        <div>Caroline Olsmats</div>
        <div>Maria Pomelov</div>
        <div>Kristen Chiu</div>
        <div>Nicholas Wong</div>
        <div>Devan O&posBoyle</div>
      </div>
      <img className='home__container--sammy' src={Sammy}></img>
    </div>
  )
}

export default Home
