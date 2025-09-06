
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DetectionPage } from './screens/DetectionPage/DetectionPage'
import { Hero } from './components/Hero'
import { AboutPage } from './screens/AboutPage/AboutPage'
import { AnalysisPage } from './screens/AnalysisPage/AnalysisPage'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/detection" element={<DetectionPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
