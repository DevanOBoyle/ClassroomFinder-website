import React from "react"
import { Routes, Route } from "react-router-dom"
import Header from "./components/header/index"
import Footer from "./components/footer/index"
import Home from "./home/index"
import "./App.scss"

const App: React.FC = () => {
  return (
    <div className='app'>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
