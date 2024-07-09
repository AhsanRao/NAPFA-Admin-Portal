import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === 'admin@portal.cc' && password === 'admin@portal.cc') {
      localStorage.setItem('auth', 'admin');
      navigate('/schools');
      setSnackbarMessage('Admin Login successful');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else if (email === 'user@portal.cc' && password === 'user@portal.cc') {
      localStorage.setItem('auth', 'user');
      navigate('/schools');
      setSnackbarMessage('User login successful');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Invalid credentials');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div className="flex h-screen">
      <div
        className="w-full md:w-1/2 bg-cover bg-center ml-10 m-6 rounded-3xl"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/login.png)`,
        }}
      ></div>
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center mx-10">
        <h2 className="text-3xl font-bold mb-4 text-left">Login Welcome Back</h2>
        <p className="mb-14 text-gray-600 text-left">Welcome back! Please enter your details.</p>
        <div className="mb-6 w-full">
          <label className="block text-left mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border rounded-md"
          />
        </div>
        <div className="mb-6 w-full relative">
          <label className="block text-left mb-2">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border rounded-md"
          />
          <button
            type="button"
            className="absolute right-3 top-12"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600 mt-6"
        >
          Login
        </button>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Login;