import React from "react"
import { Routes, Route } from "react-router-dom"
import NavBar from "./components/navbar/index"
import MapPage from "./components/map-page"
import Footer from "./components/footer/index"
import Home from "./home/index"
import "./App.scss"

const App: React.FC = () => {
  return (
    <div className='app'>
      <NavBar />
      <Routes>
        {/* Paths should be modified */}
        <Route path='/' element={<MapPage />} />
        <Route path='/home' element={<Home />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
