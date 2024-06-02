import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-6 py-3 bg-blue-500 text-white text-lg rounded-full hover:bg-blue-600">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;