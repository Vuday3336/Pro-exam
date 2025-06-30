import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Target,
  School,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    school: user?.school || '',
    class_level: user?.class_level || '',
    target_exam: user?.target_exam || []
  });

  const examOptions = [
    'JEE Main',
    'NEET',
    'EMCET Engineering',
    'EMCET Medical'
  ];

  const classOptions = [
    '11th',
    '12th',
    'Dropper'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        target_exam: checked 
          ? [...prev.target_exam, value]
          : prev.target_exam.filter(exam => exam !== value)
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      school: user?.school || '',
      class_level: user?.class_level || '',
      target_exam: user?.target_exam || []
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <p className="text-gray-400">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8"
          >
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  {user?.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.full_name}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                  {user?.google_id && (
                    <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs mt-1">
                      Google Account
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true} // Email should not be editable
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Class/Level
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="class_level"
                        value={formData.class_level}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="" className="bg-slate-800">Select class</option>
                        {classOptions.map(option => (
                          <option key={option} value={option} className="bg-slate-800">{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Academic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    School/Institute
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      placeholder="Enter your school/institute"
                    />
                  </div>
                </div>
              </div>

              {/* Target Exams */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Target Exams
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {examOptions.map(exam => (
                    <label key={exam} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="target_exam"
                        value={exam}
                        checked={formData.target_exam.includes(exam)}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className={`${isEditing ? 'text-gray-300' : 'text-gray-400'}`}>
                        {exam}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-4 pt-6 border-t border-white/20"
                >
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex-1"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex-1"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Account Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white">{new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-white">
                  {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Type:</span>
                <span className="text-white">Student</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;