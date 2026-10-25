import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DetectionPage } from './screens/DetectionPage/DetectionPage'
import { Hero } from './components/Hero'
import { AboutPage } from './screens/AboutPage/AboutPage'
import { AnalysisPage } from './screens/AnalysisPage/AnalysisPage'
import { ReportsPage } from './screens/ReportsPage/ReportsPage'
import { AuthPage } from './screens/AuthPage/AuthPage'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/auth/RequireAuth'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/detection"
            element={
              <RequireAuth>
                <DetectionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/analysis"
            element={
              <RequireAuth>
                <AnalysisPage />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth>
                <ReportsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
