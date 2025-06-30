import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Users, 
  Target,
  Zap,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useExam } from '../contexts/ExamContext';
import { useAuth } from '../contexts/AuthContext';

const QuickExamSetup = () => {
  const navigate = useNavigate();
  const { createExam, examLoading } = useExam();
  const { user } = useAuth();
  
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [questionCount, setQuestionCount] = useState(30);
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('Medium');

  // Exam configurations
  const examTypes = [
    {
      id: 'JEE Main',
      name: 'JEE Main',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      defaultQuestions: 75,
      defaultDuration: 180,
      pattern: '75 Questions • 3 Hours',
      color: 'from-blue-500 to-cyan-500',
      description: 'Physics (25Q), Chemistry (25Q), Mathematics (25Q)'
    },
    {
      id: 'NEET',
      name: 'NEET',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      defaultQuestions: 180,
      defaultDuration: 180,
      pattern: '180 Questions • 3 Hours',
      color: 'from-green-500 to-emerald-500',
      description: 'Physics (45Q), Chemistry (45Q), Biology (90Q)'
    },
    {
      id: 'EAMCET Engineering',
      name: 'EAMCET Engineering',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      defaultQuestions: 160,
      defaultDuration: 180,
      pattern: '160 Questions • 3 Hours',
      color: 'from-purple-500 to-pink-500',
      description: 'Physics (40Q), Chemistry (40Q), Mathematics (80Q)'
    },
    {
      id: 'EMCET Medical',
      name: 'EMCET Medical',
      subjects: ['Physics', 'Chemistry', 'Biology'],
      defaultQuestions: 160,
      defaultDuration: 180,
      pattern: '160 Questions • 3 Hours',
      color: 'from-orange-500 to-red-500',
      description: 'Physics (40Q), Chemistry (40Q), Biology (80Q)'
    }
  ];

  const questionOptions = [10, 15, 20, 30, 45, 50, 75, 90, 160, 180];
  const durationOptions = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hr' },
    { value: 90, label: '1.5 hr' },
    { value: 120, label: '2 hr' },
    { value: 180, label: '3 hr' }
  ];

  const difficultyOptions = [
    { value: 'Easy', color: 'text-green-400', description: 'Basic concepts and formulas' },
    { value: 'Medium', color: 'text-yellow-400', description: 'Moderate problem solving' },
    { value: 'Hard', color: 'text-red-400', description: 'Advanced and tricky questions' },
    { value: 'Mixed', color: 'text-purple-400', description: 'Balanced difficulty mix' }
  ];

  // Handle exam type selection
  const handleExamTypeSelect = (examType) => {
    setSelectedExamType(examType.id);
    setSelectedSubjects(examType.subjects);
    setQuestionCount(examType.defaultQuestions);
    setDuration(examType.defaultDuration);
  };

  // Handle subject toggle
  const handleSubjectToggle = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  // Handle form submission
  const handleStartExam = async () => {
    if (!selectedExamType || selectedSubjects.length === 0) {
      return;
    }

    const examConfig = {
      exam_type: selectedExamType,
      subjects: selectedSubjects,
      question_count: questionCount,
      duration: duration,
      difficulty: difficulty
    };

    const result = await createExam(examConfig);
    
    if (result.success) {
      navigate(`/exam/${result.exam.id}`);
    }
  };

  const selectedExam = examTypes.find(exam => exam.id === selectedExamType);

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
              <h1 className="text-2xl font-bold text-white">Quick Exam Setup</h1>
              <p className="text-gray-400">Configure your practice test in seconds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Quick Setup Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Quick Exam Setup</h2>
              <p className="text-gray-400">Select your preferences and start practicing with AI-generated questions</p>
            </div>

            {/* Exam Type Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                SELECT EXAM TYPE:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {examTypes.map((exam) => (
                  <motion.button
                    key={exam.id}
                    onClick={() => handleExamTypeSelect(exam)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border transition-all text-left ${
                      selectedExamType === exam.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${exam.color} flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      {selectedExamType === exam.id && (
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-1">{exam.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">{exam.pattern}</p>
                    <p className="text-xs text-gray-500">{exam.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            {selectedExamType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  SELECT SUBJECTS:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subject) => {
                    const isAvailable = selectedExam?.subjects.includes(subject);
                    const isSelected = selectedSubjects.includes(subject);
                    
                    return (
                      <button
                        key={subject}
                        onClick={() => isAvailable && handleSubjectToggle(subject)}
                        disabled={!isAvailable}
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : isAvailable
                            ? 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                            : 'border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{subject}</span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-blue-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Configuration Options */}
            {selectedSubjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-3 gap-6 mb-8"
              >
                {/* Question Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    NUMBER OF QUESTIONS:
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {questionOptions.map(count => (
                      <option key={count} value={count} className="bg-slate-800">
                        {count} Questions
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    TIME DURATION:
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-slate-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    DIFFICULTY LEVEL:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {difficultyOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDifficulty(option.value)}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          difficulty === option.value
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Start Exam Button */}
            {selectedSubjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <button
                  onClick={handleStartExam}
                  disabled={examLoading}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {examLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>
                        {questionCount >= 75 ? 'Generating (1-2 min)...' :
                         questionCount >= 50 ? 'Generating (30-60s)...' :
                         questionCount >= 20 ? 'Generating (15-30s)...' :
                         'Generating AI Questions...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>START EXAM NOW</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                {selectedExamType && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                      {selectedExamType} • {selectedSubjects.join(', ')} • {questionCount} Questions • {duration} minutes
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      AI will generate unique questions that never repeat
                      {questionCount >= 50 && (
                        <span className="block text-yellow-400 mt-1">
                          ⏱️ Large question sets take longer for quality content
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">
                Dynamic question generation with never-repeating content
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Timer</h3>
              <p className="text-gray-400 text-sm">
                Accurate timing with auto-submission and progress tracking
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Detailed Analysis</h3>
              <p className="text-gray-400 text-sm">
                Comprehensive results with explanations and insights
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuickExamSetup;