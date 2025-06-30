import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ExamContext = createContext();

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const ExamProvider = ({ children }) => {
  const [currentExam, setCurrentExam] = useState(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examResults, setExamResults] = useState(null);

  const createExam = async (examConfig) => {
    setExamLoading(true);
    toast.loading('Generating AI-powered questions...', { id: 'exam-creation' });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/create`, examConfig);
      const exam = response.data.exam;
      
      setCurrentExam(exam);
      toast.success('Exam created successfully!', { id: 'exam-creation' });
      
      return { success: true, exam };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create exam';
      toast.error(message, { id: 'exam-creation' });
      return { success: false, error: message };
    } finally {
      setExamLoading(false);
    }
  };

  const getExam = async (examId) => {
    setExamLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/${examId}`);
      const exam = response.data;
      
      setCurrentExam(exam);
      return { success: true, exam };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to load exam';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setExamLoading(false);
    }
  };

  const startExam = async (examId) => {
    try {
      await axios.post(`${API_BASE_URL}/exams/${examId}/start`);
      
      // Update current exam status
      if (currentExam && currentExam.id === examId) {
        setCurrentExam({ ...currentExam, status: 'ongoing', start_time: new Date() });
      }
      
      toast.success('Exam started!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to start exam';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const submitExam = async (examId, answers) => {
    setExamLoading(true);
    toast.loading('Calculating results...', { id: 'exam-submission' });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/${examId}/submit`, {
        exam_id: examId,
        answers
      });
      
      const result = response.data.result;
      setExamResults(result);
      
      // Update current exam status
      if (currentExam && currentExam.id === examId) {
        setCurrentExam({ ...currentExam, status: 'completed' });
      }
      
      toast.success('Exam submitted successfully!', { id: 'exam-submission' });
      return { success: true, result };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to submit exam';
      toast.error(message, { id: 'exam-submission' });
      return { success: false, error: message };
    } finally {
      setExamLoading(false);
    }
  };

  const getExamResult = async (examId) => {
    setExamLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/${examId}/result`);
      const result = response.data;
      
      setExamResults(result);
      return { success: true, result };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to load results';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setExamLoading(false);
    }
  };

  const value = {
    currentExam,
    examLoading,
    examResults,
    createExam,
    getExam,
    startExam,
    submitExam,
    getExamResult,
    setCurrentExam,
    setExamResults
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};