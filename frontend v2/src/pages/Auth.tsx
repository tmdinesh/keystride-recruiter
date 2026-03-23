import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl space-y-8 transform transition-all duration-300 ease-in-out hover:scale-105">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-3 text-lg font-medium rounded-l-lg transition-colors duration-200 ${
              isLogin
                ? 'bg-indigo-700 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-3 text-lg font-medium rounded-r-lg transition-colors duration-200 ${
              !isLogin
                ? 'bg-indigo-700 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Register
          </button>
        </div>
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export default Auth;
