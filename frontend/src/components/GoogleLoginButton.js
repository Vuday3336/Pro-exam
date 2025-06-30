import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google login success:', credentialResponse);
      
      // Extract the credential (JWT token) from Google's response
      const result = await googleLogin(credentialResponse.credential);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        size="large"
        width="100%"
        theme="outline"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </motion.div>
  );
};

export default GoogleLoginButton;