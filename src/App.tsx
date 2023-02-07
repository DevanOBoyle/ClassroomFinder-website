import React from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./home/index"
import Form from "./components/form"
import MapWrapper from "./components/map"
import "./App.scss"

const App: React.FC = () => {
  return (
    <div className='app'>
      <Routes>
        {/* Paths should be modified */}
        <Route path='/' element={<Home />} />
        <Route path='/map' element={<MapWrapper />} />
        <Route path='/form' element={<Form />} />
      </Routes>
    </div>
  )
}

export default App
