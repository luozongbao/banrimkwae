import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { DesignSystemDemo } from './components/DesignSystemDemo'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-off-white">
          <Routes>
            <Route path="/" element={<DesignSystemDemo />} />
            <Route path="/design-system" element={<DesignSystemDemo />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
