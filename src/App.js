import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Schools from './pages/Schools';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
      <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />        
        <Route
          path="/schools"
          element={
            <PrivateRoute>
              <Schools />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;