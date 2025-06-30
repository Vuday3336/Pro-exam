import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  Home,
  RotateCcw,
  Share,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useExam } from '../contexts/ExamContext';

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { examResults, getExamResult, examLoading } = useExam();
  const [showSolutions, setShowSolutions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    if (examId) {
      loadResults();
    }
  }, [examId]);

  const loadResults = async () => {
    await getExamResult(examId);
  };

  if (examLoading || !examResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🎉';
    if (percentage >= 70) return '👏';
    if (percentage >= 60) return '👍';
    if (percentage >= 50) return '😊';
    return '📚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Exam Results</h1>
              <p className="text-gray-400">Detailed analysis of your performance</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/dashboard"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/quick-exam"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Take Another</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">{getGradeEmoji(examResults.percentage)}</div>
            <h2 className="text-4xl font-bold text-white mb-2">
              <span className={getScoreColor(examResults.percentage)}>
                {examResults.percentage.toFixed(1)}%
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              {examResults.correct_answers} out of {examResults.total_questions} correct
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{examResults.score}</p>
                <p className="text-gray-400 text-sm">Score</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{examResults.time_taken}</p>
                <p className="text-gray-400 text-sm">Minutes</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{examResults.correct_answers}</p>
                <p className="text-gray-400 text-sm">Correct</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {((examResults.correct_answers / examResults.time_taken) * 60).toFixed(1)}
                </p>
                <p className="text-gray-400 text-sm">Q/Hour</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subject-wise Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Subject-wise Performance
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(examResults.subject_wise_score).map(([subject, scores]) => {
              const percentage = (scores.correct / scores.total) * 100;
              return (
                <div key={subject} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white">{subject}</h4>
                    <span className={`text-lg font-bold ${getScoreColor(percentage)}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    {scores.correct} / {scores.total} correct
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Question Analysis Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Question-by-Question Analysis</h3>
            <button
              onClick={() => setShowSolutions(!showSolutions)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showSolutions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSolutions ? 'Hide' : 'Show'} Solutions</span>
            </button>
          </div>

          {showSolutions && (
            <div className="space-y-4">
              {examResults.detailed_analysis.map((analysis, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    analysis.is_correct 
                      ? 'bg-green-500/10 border-green-500' 
                      : 'bg-red-500/10 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-white">Q{parseInt(analysis.question_id) + 1}</span>
                      <span className="text-sm text-gray-400">{analysis.subject}</span>
                      {analysis.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      analysis.is_correct ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {analysis.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="text-white mb-4">{analysis.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {analysis.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg text-sm ${
                          optionIndex === analysis.correct_answer
                            ? 'bg-green-500/20 border border-green-500 text-green-300'
                            : optionIndex === analysis.user_answer && !analysis.is_correct
                            ? 'bg-red-500/20 border border-red-500 text-red-300'
                            : 'bg-white/5 text-gray-300'
                        }`}
                      >
                        <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option}
                        {optionIndex === analysis.correct_answer && (
                          <span className="ml-2 text-xs">(Correct)</span>
                        )}
                        {optionIndex === analysis.user_answer && optionIndex !== analysis.correct_answer && (
                          <span className="ml-2 text-xs">(Your Answer)</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-2">Solution:</h5>
                    <p className="text-gray-300 text-sm">{analysis.solution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center space-x-4"
        >
          <Link
            to="/quick-exam"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Practice Again</span>
          </Link>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamResults;