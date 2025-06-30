import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Plus,
  BarChart3,
  User,
  LogOut,
  Zap,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const examTypeColors = {
    'JEE Main': 'from-blue-400 to-blue-600',
    'NEET': 'from-green-400 to-green-600',
    'EAMCET Engineering': 'from-purple-400 to-purple-600',
    'EAMCET Medical': 'from-orange-400 to-orange-600'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">ExamAce Pro</h1>
                <p className="text-xs sm:text-sm text-gray-400">Welcome back, {user?.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-end">
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Profile</span>
              </Link>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.full_name}! 👋
          </h2>
          <p className="text-gray-400">
            Ready to ace your exams? Let's continue your preparation journey.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Quick Exam Setup</h3>
                <p className="text-blue-100 mb-4">
                  Start a practice test in under 30 seconds with AI-generated questions
                </p>
                <Link
                  to="/quick-exam"
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  <span>Start Quick Exam</span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-400">Total Exams</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardData.stats.total_exams}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-400">Completed</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardData.stats.completed_exams}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-400">Average Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardData.stats.average_score}%</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-gray-400">Best Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardData.stats.best_score}%</p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Exams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Exams</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            {dashboardData?.recent_exams?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_exams.slice(0, 5).map((exam, index) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${examTypeColors[exam.exam_type] || 'from-gray-400 to-gray-600'} rounded-lg flex items-center justify-center`}>
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{exam.exam_type}</p>
                        <p className="text-sm text-gray-400">
                          {exam.configuration.question_count} Questions • {exam.configuration.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        exam.status === 'completed' ? 'text-green-400' : 
                        exam.status === 'ongoing' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(exam.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No exams taken yet</p>
                <Link
                  to="/quick-exam"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Take Your First Exam</span>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Target Exams</h3>
              <Target className="w-5 h-5 text-gray-400" />
            </div>

            {user?.target_exam?.length > 0 ? (
              <div className="space-y-4">
                {user.target_exam.map((exam, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{exam}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${examTypeColors[exam] || 'from-gray-400 to-gray-600'} text-white`}>
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Ready for practice • AI questions available
                    </p>
                  </div>
                ))}
                
                <Link
                  to="/quick-exam"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  Practice Now
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No target exams set</p>
                <Link
                  to="/profile"
                  className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Update Profile</span>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Results */}
        {dashboardData?.recent_results?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Results</h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.recent_results.slice(0, 3).map((result, index) => (
                <div key={result.exam_id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {result.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Score</span>
                      <span>{result.correct_answers}/{result.total_questions}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Time: {result.time_taken} minutes
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;