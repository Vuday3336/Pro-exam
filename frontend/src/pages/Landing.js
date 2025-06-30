import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Target, Trophy, Users, Zap } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Questions",
      description: "Dynamic question generation with never-repeating content using advanced AI"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Multi-Exam Support",
      description: "JEE Main, NEET, EAMCET Engineering & Medical - all in one platform"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Quick Setup",
      description: "Start your practice test in under 30 seconds with our streamlined interface"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Detailed Analytics",
      description: "Comprehensive performance tracking with subject-wise breakdowns"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Exam-Specific Patterns",
      description: "Questions tailored to exact patterns of JEE, NEET, and EAMCET exams"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed progress insights"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            ExamAce Pro
          </motion.div>
          <div className="space-x-4">
            <Link to="/login" className="text-white hover:text-blue-400 transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Master Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {" "}Exam Dreams
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Revolutionary AI-powered practice portal for JEE Main, NEET, EAMCET Engineering & Medical. 
            Experience the future of exam preparation with dynamic questions that never repeat.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-x-4"
          >
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Start Free Practice
            </Link>
            <Link 
              to="/login" 
              className="border border-gray-300 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
            >
              Login to Continue
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose ExamAce Pro?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience the most advanced exam preparation platform designed specifically for Indian competitive exams
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all"
            >
              <div className="text-blue-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exam Types Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Supported Examinations</h2>
          <p className="text-gray-300 text-lg">
            Complete preparation for all major competitive exams
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "JEE Main",
              subjects: ["Physics", "Chemistry", "Mathematics"],
              color: "from-blue-500 to-cyan-500",
              pattern: "75 Questions • 3 Hours"
            },
            {
              name: "NEET",
              subjects: ["Physics", "Chemistry", "Biology"],
              color: "from-green-500 to-emerald-500",
              pattern: "180 Questions • 3 Hours"
            },
            {
              name: "EMCET Engineering",
              subjects: ["Physics", "Chemistry", "Mathematics"],
              color: "from-purple-500 to-pink-500",
              pattern: "160 Questions • 3 Hours"
            },
            {
              name: "EMCET Medical",
              subjects: ["Physics", "Chemistry", "Biology"],
              color: "from-orange-500 to-red-500",
              pattern: "160 Questions • 3 Hours"
            }
          ].map((exam, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${exam.color} flex items-center justify-center mb-4`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{exam.name}</h3>
              <p className="text-gray-300 text-sm mb-3">{exam.pattern}</p>
              <div className="space-y-1">
                {exam.subjects.map((subject, idx) => (
                  <div key={idx} className="text-sm text-gray-400">• {subject}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-2xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Ace Your Exams?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their exam preparation with our AI-powered platform
          </p>
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block"
          >
            Start Your Journey Now
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2025 ExamAce Pro. All rights reserved. Built with ❤️ for student success.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;