import React from 'react'
import './App.css'
import { Hero } from './components/Hero'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Hero />
      </div>
    </BrowserRouter>
  )
}

export default App
