import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { DesignSystemDemo } from './components/DesignSystemDemo'
import { UserManagementPage } from './pages/users/UserManagementPage'
import { UserProfilePage } from './pages/users/UserProfilePage'
import { RoleManagementPage } from './pages/roles/RoleManagementPage'
import { SettingsPage } from './pages/settings/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-off-white">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/design-system" 
              element={
                <ProtectedRoute>
                  <DesignSystemDemo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/roles" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <RoleManagementPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
