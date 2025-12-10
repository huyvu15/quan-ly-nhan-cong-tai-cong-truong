import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Workers from './pages/Workers';
import Departments from './pages/Departments';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="workers" element={<Workers />} />
            <Route path="departments" element={<Departments />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

