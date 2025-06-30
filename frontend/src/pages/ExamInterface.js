import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Flag, 
  CheckCircle2, 
  Circle,
  SkipForward,
  Save,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useExam } from '../contexts/ExamContext';

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentExam, getExam, startExam, submitExam, examLoading } = useExam();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showMobileQuestionPalette, setShowMobileQuestionPalette] = useState(false);

  // Load exam data
  useEffect(() => {
    if (examId) {
      getExam(examId);
    }
  }, [examId, getExam]);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  // Start exam
  useEffect(() => {
    if (currentExam && currentExam.questions.length > 0 && !examStarted) {
      setTimeLeft(currentExam.time_limit * 60); // Convert minutes to seconds
      setExamStarted(true);
    }
  }, [currentExam, examStarted]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleMarkForReview = (questionIndex) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const handleAutoSubmit = useCallback(async () => {
    if (currentExam) {
      try {
        await submitExam(currentExam.id, answers);
        navigate(`/results/${currentExam.id}`);
      } catch (error) {
        console.error('Auto-submit failed:', error);
      }
    }
  }, [currentExam, answers, submitExam, navigate]);

  const handleSubmitExam = async () => {
    try {
      await submitExam(currentExam.id, answers);
      navigate(`/results/${currentExam.id}`);
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  // Group questions by subject
  const subjectGroups = currentExam?.questions.reduce((groups, question, index) => {
    const subject = question.subject;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push({ ...question, originalIndex: index });
    return groups;
  }, {}) || {};

  // Get question status for palette
  const getQuestionStatus = (questionIndex) => {
    const isAnswered = answers.hasOwnProperty(questionIndex);
    const isMarked = markedForReview.has(questionIndex);
    
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    if (questionIndex <= currentQuestionIndex) return 'not-answered';
    return 'not-visited';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'answered-marked': return 'bg-purple-500 text-white';
      case 'marked': return 'bg-blue-500 text-white';
      case 'not-answered': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white border border-white/20';
    }
  };

  if (!currentExam || !currentExam.questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col lg:flex-row">
      {/* Question Palette - Desktop Sidebar / Mobile Collapsible */}
      <div className="lg:w-1/4 bg-black/20 backdrop-blur-lg border-b lg:border-r lg:border-b-0 border-white/20 lg:overflow-y-auto">
        {/* Mobile Question Palette Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileQuestionPalette(!showMobileQuestionPalette)}
            className="w-full flex items-center justify-between p-4 text-white bg-black/30 hover:bg-black/40 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5" />
              <span className="font-semibold">Question Palette</span>
              <span className="text-sm text-gray-400">({currentQuestionIndex + 1}/{currentExam.questions.length})</span>
            </div>
            {showMobileQuestionPalette ? 
              <ChevronUp className="w-5 h-5" /> : 
              <ChevronDown className="w-5 h-5" />
            }
          </button>
        </div>

        {/* Question Palette Content */}
        <div className={`${showMobileQuestionPalette ? 'block' : 'hidden'} lg:block p-4`}>
          {/* Timer */}
          <div className="mb-6">
            <div className={`text-center p-4 rounded-lg ${
              timeLeft < 300 ? 'bg-red-500/20 border-red-500' : 'bg-blue-500/20 border-blue-500'
            } border`}>
              <Clock className="w-6 h-6 mx-auto mb-2 text-white" />
              <p className="text-2xl font-bold text-white">{formatTime(timeLeft)}</p>
              <p className="text-xs text-gray-400">Time Remaining</p>
            </div>
          </div>

          {/* Subject-wise Question Navigation */}
          <div className="space-y-4">
            {Object.entries(subjectGroups).map(([subject, questions]) => (
              <div key={subject} className="bg-white/5 rounded-lg p-3">
                <h3 className="text-white font-semibold mb-3 text-sm">{subject}</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-2">
                  {questions.map((question, idx) => {
                    const originalIndex = question.originalIndex;
                    const status = getQuestionStatus(originalIndex);
                    return (
                      <button
                        key={originalIndex}
                        onClick={() => {
                          setCurrentQuestionIndex(originalIndex);
                          setShowMobileQuestionPalette(false); // Auto-close on mobile after selection
                        }}
                        className={`w-12 h-12 sm:w-10 sm:h-10 lg:w-10 lg:h-10 rounded-lg text-sm font-semibold transition-all ${
                          getStatusColor(status)
                        } ${
                          originalIndex === currentQuestionIndex ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        {originalIndex + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-400">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-gray-400">Answered & Marked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-400">Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-400">Not Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-400">Not Visited</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Main Content Area (75% on desktop, full width on mobile) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Timer and Submit Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-white/20 p-3">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-red-500/20 border-red-500' : 'bg-blue-500/20 border-blue-500'
            } border`}>
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-bold">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Question Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-white">
                Question {currentQuestionIndex + 1} of {currentExam.questions.length}
              </h2>
              <p className="text-gray-400 text-sm lg:text-base">
                {currentQuestion.subject} • {currentQuestion.difficulty}
              </p>
            </div>
          </div>

          {/* Question Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 mb-6"
            >
              <div className="mb-6">
                <p className="text-lg text-white leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={index}
                      checked={answers[currentQuestionIndex] === index}
                      onChange={() => handleAnswerSelect(currentQuestionIndex, index)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {answers[currentQuestionIndex] === index && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white text-base">
                      <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => handleMarkForReview(currentQuestionIndex)}
                className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto ${
                  markedForReview.has(currentQuestionIndex)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{markedForReview.has(currentQuestionIndex) ? 'Unmark' : 'Mark for Review'}</span>
                <span className="sm:hidden">{markedForReview.has(currentQuestionIndex) ? 'Unmark' : 'Mark'}</span>
              </button>
            </div>

            <div className="w-full sm:w-auto">
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(currentExam.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === currentExam.questions.length - 1}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Submit Exam?</h3>
                <p className="text-gray-400">
                  Are you sure you want to submit your exam? This action cannot be undone.
                </p>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-green-400 font-bold">{Object.keys(answers).length}</p>
                    <p className="text-gray-400">Answered</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-red-400 font-bold">{currentExam.questions.length - Object.keys(answers).length}</p>
                    <p className="text-gray-400">Unanswered</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={examLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {examLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamInterface;