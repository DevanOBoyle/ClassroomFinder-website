import React from "react"
import "./index.scss"

const Footer = () => {
  return (
    <div className='footer'>
      <img
        className='footer-logo'
        src={require("../../images/UCSC-logo.png")}
        alt='UC Santa Cruz logo'
      ></img>
      <div className='footer-line'></div>
      <div className='footer-text'>
        <h2>
          Brought to you by:<br></br>
        </h2>
        <p>
          Caroline Olsmats, Maria Pomelov, Kristen Chiu, Nicholas Wong & Devan
          O’Boyle
        </p>
      </div>
    </div>
  )
}

export default Footer
