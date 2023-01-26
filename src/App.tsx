import React from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./home"
import Form from "./components/form"
import MyMap from "./components/map"
import "./App.scss"

const App: React.FC = () => {
  return (
    <div className='app'>
      <Routes>
        {/* Paths should be modified */}
        <Route path='/' element={<MyMap />} />
        <Route path='/' element={<Form />} />
        <Route path='/' element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
