import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagicLinkForm from '../components/MagicLinkForm';

const SignInPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    console.log('Navigate back to landing page');
    // Add your navigation logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <Link to="/"> 
          <button
            onClick={handleBackToHome}
            className="mb-8 text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
          </Link>

          {/* Sign In Form Container with Animation */}
          <div className={`bg-white/8 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-300 text-lg">Sign in to access your secure file sharing dashboard</p>
            </div>

            {/* Magic Form Component will be rendered here */}
            {/* You can replace this comment with <MagicForm /> when using in your project */}
            <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-500 rounded-lg">
              <MagicLinkForm classy />
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 File Share. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SignInPage;