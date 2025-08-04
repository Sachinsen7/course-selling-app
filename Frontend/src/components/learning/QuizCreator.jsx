import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { showModal } from '../../Redux/slices/uiSlice';
import { createQuiz, createQuestion, getQuizForInstructor, updateLecture, updateQuiz, deleteQuiz } from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';

function QuizCreator({ lectureId, courseId, onQuizCreated }) {
  const dispatch = useDispatch();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    passPercentage: 70,
    isPublished: false
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'multiple-choice',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    correctAnswer: '',
    points: 1,
    order: 0
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [existingQuiz, setExistingQuiz] = useState(null);
  const [checkingExistingQuiz, setCheckingExistingQuiz] = useState(false);

  // Check if quiz already exists for this lecture
  const checkExistingQuiz = useCallback(async () => {
    if (!lectureId) return;

    setCheckingExistingQuiz(true);
    try {
      const response = await getQuizForInstructor(lectureId);
      if (response && response.quiz) {
        setExistingQuiz(response.quiz);
        dispatch(showModal({
          title: 'Quiz Already Exists',
          message: `This lecture already has a quiz titled "${response.quiz.title}". You can edit the existing quiz instead of creating a new one.`,
          type: 'info'
        }));
      }
    } catch (error) {
      // If 404, no quiz exists - this is fine
      if (error.response?.status !== 404) {
        console.error('Error checking existing quiz:', error);
      }
    } finally {
      setCheckingExistingQuiz(false);
    }
  }, [lectureId, dispatch]);

  // Delete existing quiz and allow creating a new one
  const handleDeleteExistingQuiz = useCallback(async () => {
    if (!existingQuiz) return;

    try {
      await deleteQuiz(existingQuiz._id);
      setExistingQuiz(null);
      dispatch(showModal({
        title: 'Quiz Deleted',
        message: 'The existing quiz has been deleted. You can now create a new quiz.',
        type: 'success'
      }));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      dispatch(showModal({
        title: 'Deletion Failed',
        message: error.message || 'Failed to delete the existing quiz.',
        type: 'error'
      }));
    }
  }, [existingQuiz, dispatch]);

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' }
  ];

  const handleQuizDataChange = useCallback((e) => {
    e.stopPropagation();
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              name === 'passPercentage' ? Number(value) || 0 :
              value
    }));
  }, []);

  const handleQuestionChange = useCallback((e) => {
    e.stopPropagation();
    const { name, value } = e.target;

    if (name === 'type') {
      // Reset question structure based on type
      if (value === 'multiple-choice') {
        setCurrentQuestion(prev => ({
          ...prev,
          type: value,
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
          correctAnswer: ''
        }));
      } else if (value === 'short-answer') {
        setCurrentQuestion(prev => ({
          ...prev,
          type: value,
          options: [],
          correctAnswer: ''
        }));
      } else if (value === 'true-false') {
        setCurrentQuestion(prev => ({
          ...prev,
          type: value,
          options: [],
          correctAnswer: ''
        }));
      }
    } else if (name === 'trueFalseAnswer') {
      setCurrentQuestion(prev => ({
        ...prev,
        correctAnswer: value
      }));
    } else {
      setCurrentQuestion(prev => ({
        ...prev,
        [name]: name === 'points' ? Number(value) || 1 : value
      }));
    }
  }, []);

  const handleOptionChange = useCallback((index, field, value, event = null) => {
    if (event) event.stopPropagation();
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    }));
  }, []);

  const addOption = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  }, []);

  const removeOption = useCallback((index, e) => {
    if (e) e.stopPropagation();
    if (currentQuestion.options.length > 2) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  }, [currentQuestion.options.length]);

  const handleAddQuestion = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentQuestion({
      text: '',
      type: 'multiple-choice',
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correctAnswer: '',
      points: 1,
      order: questions.length
    });
    setEditingQuestionIndex(-1);
    setShowQuestionForm(true);
  }, [questions.length]);

  const handleEditQuestion = useCallback((index, e) => {
    if (e) e.stopPropagation();
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  }, [questions]);

  const handleSaveQuestion = useCallback((e) => {
    if (e) e.stopPropagation();

    if (!currentQuestion.text.trim()) {
      dispatch(showModal({
        title: 'Validation Error',
        message: 'Question text is required.',
        type: 'error'
      }));
      return;
    }

    if (currentQuestion.text.trim().length < 5) {
      dispatch(showModal({
        title: 'Validation Error',
        message: 'Question text must be at least 5 characters long.',
        type: 'error'
      }));
      return;
    }

    if (currentQuestion.type === 'multiple-choice') {
      const validOptions = currentQuestion.options.filter(opt => opt.text.trim());

      if (validOptions.length < 2) {

        dispatch(showModal({
          title: 'Validation Error',
          message: 'Multiple choice questions need at least 2 options.',
          type: 'error'
        }));
        return;
      }

      // Check if all options meet minimum length requirement
      const shortOptions = validOptions.filter(opt => opt.text.trim().length < 2);
      if (shortOptions.length > 0) {

        dispatch(showModal({
          title: 'Validation Error',
          message: 'Each option must be at least 2 characters long.',
          type: 'error'
        }));
        return;
      }

      const correctOptions = validOptions.filter(opt => opt.isCorrect);

      if (correctOptions.length === 0) {
        dispatch(showModal({
          title: 'Validation Error',
          message: 'Please mark at least one correct answer.',
          type: 'error'
        }));
        return;
      }


    }

    if (currentQuestion.type === 'true-false') {
      if (!currentQuestion.correctAnswer || (currentQuestion.correctAnswer !== 'true' && currentQuestion.correctAnswer !== 'false')) {
        dispatch(showModal({
          title: 'Validation Error',
          message: 'Please select the correct answer (True or False).',
          type: 'error'
        }));
        return;
      }
    }

    if (currentQuestion.type === 'short-answer') {
      if (!currentQuestion.correctAnswer.trim()) {
        dispatch(showModal({
          title: 'Validation Error',
          message: 'Please provide the correct answer for short answer questions.',
          type: 'error'
        }));
        return;
      }

      if (currentQuestion.correctAnswer.trim().length < 1) {
        dispatch(showModal({
          title: 'Validation Error',
          message: 'The correct answer must be at least 1 character long.',
          type: 'error'
        }));
        return;
      }
    }

    const questionToSave = {
      ...currentQuestion,
      options: currentQuestion.type === 'multiple-choice' ?
        currentQuestion.options.filter(opt => opt.text.trim()) : []
    };

    if (editingQuestionIndex >= 0) {
      setQuestions(prev => prev.map((q, i) => i === editingQuestionIndex ? questionToSave : q));
      dispatch(showModal({
        title: 'Question Updated',
        message: 'Question has been successfully updated!',
        type: 'success'
      }));
    } else {
      setQuestions(prev => [...prev, questionToSave]);
      dispatch(showModal({
        title: 'Question Added',
        message: 'Question has been successfully added to the quiz!',
        type: 'success'
      }));
    }


    setCurrentQuestion({
      text: '',
      type: 'multiple-choice',
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correctAnswer: '',
      points: 1,
      order: 0
    });
    setEditingQuestionIndex(-1);
    setShowQuestionForm(false);
  }, [currentQuestion, editingQuestionIndex, showModal]);

  const handleDeleteQuestion = useCallback((index, e) => {
    if (e) e.stopPropagation();
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateQuiz = useCallback(async (e) => {
    console.log('🚀 handleCreateQuiz called!', {
      submitting,
      questionsLength: questions.length,
      quizData,
      lectureId,
      existingQuiz
    });
    if (e) e.stopPropagation();
    if (!quizData.title.trim()) {
      dispatch(showModal({
        title: 'Validation Error',
        message: 'Quiz title is required.',
        type: 'error'
      }));
      return;
    }

    if (quizData.title.trim().length < 3) {
      dispatch(showModal({
        title: 'Validation Error',
        message: 'Quiz title must be at least 3 characters long.',
        type: 'error'
      }));
      return;
    }

    if (questions.length === 0) {
      dispatch(showModal({
        title: 'Validation Error',
        message: 'Please add at least one question to the quiz.',
        type: 'error'
      }));
      return;
    }

    setSubmitting(true);
    try {
      const quizPayload = {
        lectureId,
        title: quizData.title,
        description: quizData.description,
        passPercentage: quizData.passPercentage,
        isPublished: quizData.isPublished
      };

      console.log('🚀 Creating quiz with payload:', quizPayload);
      console.log('📋 Questions to create:', questions);
      const quizResponse = await createQuiz(quizPayload);
      const quizId = quizResponse.quiz._id;
      console.log('Quiz created successfully:', { quizId, quizResponse });
      setCreatedQuizId(quizId);

      console.log('Quiz created successfully:', { quizId, lectureId, quizResponse });


      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionPayload = {
          quizId,
          text: question.text,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
          order: i
        };

        await createQuestion(questionPayload);
      }

      try {
        console.log('Attempting to update lecture with quiz ID:', { lectureId, quizId });
        const updateResult = await updateLecture(lectureId, { quizId });
        console.log('Lecture update successful:', updateResult);
      } catch (updateError) {
        console.error('Failed to update lecture with quiz ID:', updateError);
        console.error('Update error details:', updateError.response?.data || updateError.message);
      }

      dispatch(showModal({
        title: 'Quiz Created',
        message: 'Quiz and questions created successfully!',
        type: 'success'
      }));

      onQuizCreated(quizId);
    } catch (error) {
      console.error('Error creating quiz:', error);

      let errorMessage = 'Failed to create quiz.';
      let errorTitle = 'Creation Failed';

      if (error.response?.status === 409) {
        errorTitle = 'Quiz Already Exists';
        errorMessage = 'This lecture already has a quiz associated with it. Please use the "Check Existing Quiz" button to see the existing quiz and choose to delete it if you want to create a new one.';
        // Automatically check for existing quiz to show options
        checkExistingQuiz();
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(showModal({
        title: errorTitle,
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setSubmitting(false);
    }
  }, [quizData, questions, lectureId, dispatch, onQuizCreated]);

  const hasUnsavedChanges = useCallback(() => {
    if (editingQuestionIndex >= 0) {
      const originalQuestion = questions[editingQuestionIndex];
      return (
        currentQuestion.text !== originalQuestion.text ||
        currentQuestion.type !== originalQuestion.type ||
        currentQuestion.points !== originalQuestion.points ||
        currentQuestion.correctAnswer !== originalQuestion.correctAnswer ||
        JSON.stringify(currentQuestion.options) !== JSON.stringify(originalQuestion.options)
      );
    } else {
      return (
        currentQuestion.text.trim() !== '' ||
        currentQuestion.correctAnswer.trim() !== '' ||
        currentQuestion.options.some(opt => opt.text.trim() !== '')
      );
    }
  }, [currentQuestion, questions, editingQuestionIndex]);

  const handleQuestionFormClose = useCallback((e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (hasUnsavedChanges()) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return; 
      }
    }

    setCurrentQuestion({
      text: '',
      type: 'multiple-choice',
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correctAnswer: '',
      points: 1,
      order: 0
    });
    setEditingQuestionIndex(-1);
    setShowQuestionForm(false);
  }, [hasUnsavedChanges]);

  console.log('QuizCreator render state:', {
    quizDataTitle: quizData.title,
    questionsCount: questions.length,
    submitting,
    buttonDisabled: submitting || questions.length === 0
  });

  return (
    <div
      className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E7EB] shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-[#1B3C53]">Create Quiz</h3>
        <Button
          text={checkingExistingQuiz ? 'Checking...' : 'Check Existing Quiz'}
          onClick={checkExistingQuiz}
          className="px-4 py-2 bg-[#4A8292] text-white hover:bg-[#456882] rounded-md text-sm"
          disabled={checkingExistingQuiz || !lectureId}
        />
      </div>

      {existingQuiz && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Quiz Already Exists
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This lecture already has a quiz titled "{existingQuiz.title}".</p>
                <p className="mt-1">Choose an option below:</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  text="Delete & Create New"
                  onClick={handleDeleteExistingQuiz}
                  className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-sm"
                  disabled={submitting}
                />
                <Button
                  text="Cancel"
                  onClick={() => setExistingQuiz(null)}
                  className="px-3 py-1 bg-gray-500 text-white hover:bg-gray-600 rounded text-sm"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="quizTitle" className="block text-[#1B3C53] text-sm font-semibold mb-2">
            Quiz Title
          </label>
          <input
            key="quiz-title-input"
            type="text"
            id="quizTitle"
            name="title"
            value={quizData.title}
            onChange={handleQuizDataChange}
            onFocus={(e) => e.stopPropagation()}
            onBlur={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter quiz title..."
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF]"
            disabled={submitting}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="quizDescription" className="block text-[#1B3C53] text-sm font-semibold mb-2">
            Description (Optional)
          </label>
          <textarea
            key="quiz-description-input"
            id="quizDescription"
            name="description"
            value={quizData.description}
            onChange={handleQuizDataChange}
            onFocus={(e) => e.stopPropagation()}
            onBlur={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter quiz description..."
            rows="3"
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF] resize-vertical"
            disabled={submitting}
            autoComplete="off"
          />
        </div>

        {/* Validation Requirements Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Quiz Requirements</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Quiz title must be at least 3 characters long</li>
                  <li>Question text must be at least 5 characters long</li>
                  <li>Multiple choice options must be at least 2 characters long</li>
                  <li>At least one question is required</li>
                  <li>Multiple choice questions need at least 2 options with one correct answer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="passPercentage" className="block text-[#1B3C53] text-sm font-semibold mb-2">
              Pass Percentage
            </label>
            <input
              key="pass-percentage-input"
              type="number"
              id="passPercentage"
              name="passPercentage"
              value={quizData.passPercentage}
              onChange={handleQuizDataChange}
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53]"
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center text-[#1B3C53] text-sm font-semibold">
              <input
                key="is-published-checkbox"
                type="checkbox"
                name="isPublished"
                checked={quizData.isPublished}
                onChange={handleQuizDataChange}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="mr-2 accent-[#4A8292] focus:ring-[#4A8292]"
                disabled={submitting}
              />
              Published (Visible to students)
            </label>
          </div>
        </div>
      </div>


      <div className="border-t border-[#E5E7EB] pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-[#1B3C53]">Questions ({questions.length})</h4>
          <Button
            text="Add Question"
            onClick={(e) => handleAddQuestion(e)}
            className="px-4 py-2 bg-[#4A8292] text-white hover:bg-[#1B3C53] rounded-md font-medium transition-all duration-200"
            disabled={submitting}
          />
        </div>

        {questions.length === 0 ? (
          <p className="text-[#6B7280] text-center py-8">No questions added yet. Click "Add Question" to get started.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-[#1B3C53]">
                    {index + 1}. {question.text} ({question.type})
                  </h5>
                  <div className="flex space-x-2">
                    <Button
                      text="Edit"
                      onClick={(e) => handleEditQuestion(index, e)}
                      className="px-3 py-1 text-xs bg-[#E5E7EB] text-[#1B3C53] hover:bg-[#D1D5DB] rounded"
                      disabled={submitting}
                    />
                    <Button
                      text="Delete"
                      onClick={(e) => handleDeleteQuestion(index, e)}
                      className="px-3 py-1 text-xs bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                {question.type === 'multiple-choice' && (
                  <ul className="text-sm text-[#6B7280] ml-4">
                    {question.options.map((option, optIndex) => (
                      <li key={optIndex} className={option.isCorrect ? 'text-[#059669] font-medium' : ''}>
                        • {option.text} {option.isCorrect && '(Correct)'}
                      </li>
                    ))}
                  </ul>
                )}
                
                {question.type === 'short-answer' && (
                  <p className="text-sm text-[#059669] ml-4 font-medium">
                    Correct Answer: {question.correctAnswer}
                  </p>
                )}
                
                <p className="text-xs text-[#6B7280] mt-2">Points: {question.points}</p>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="border-t border-[#E5E7EB] pt-6 mt-6">
        {existingQuiz ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              A quiz already exists for this lecture. Please use the options above to manage the existing quiz.
            </p>
            <Button
              text="Check Existing Quiz Again"
              onClick={checkExistingQuiz}
              className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-md"
              disabled={checkingExistingQuiz}
            />
          </div>
        ) : (
          <Button
            text={submitting ? 'Creating Quiz...' : 'Create Quiz'}
            onClick={(e) => {
              console.log('🔘 Create Quiz button clicked!', {
                disabled: submitting || questions.length === 0,
                submitting,
                questionsLength: questions.length,
                quizData,
                lectureId,
                existingQuiz
              });
              handleCreateQuiz(e);
            }}
            className="w-full px-6 py-3 bg-[#1B3C53] text-white hover:bg-[#456882] rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-md"
            disabled={submitting || questions.length === 0}
          />
        )}
      </div>


      <Modal
        key="question-form-modal"
        isOpen={showQuestionForm}
        onClose={() => {}} 
        title={editingQuestionIndex >= 0 ? 'Edit Question' : 'Add New Question'}
        type="info"
        zIndex={1100}
      >
        <div
          className="space-y-4"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          {/* Custom Close Button */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E7EB]">
            <div>
              <h3 className="text-lg font-semibold text-[#1B3C53]">
                {editingQuestionIndex >= 0 ? 'Edit Question' : 'Add New Question'}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Fill in all required fields and click "Add Question" to save
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleQuestionFormClose(e);
              }}
              className="text-[#6B7280] hover:text-[#1B3C53] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A8292] p-1 rounded"
              aria-label="Close question form"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label htmlFor="questionText" className="block text-[#1B3C53] text-sm font-semibold mb-2">
              Question Text
            </label>
            <textarea
              key="question-text-input"
              id="questionText"
              name="text"
              value={currentQuestion.text}
              onChange={handleQuestionChange}
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter your question..."
              rows="3"
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF] resize-vertical"
              required
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="questionType" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Question Type
              </label>
              <select
                key="question-type-select"
                id="questionType"
                name="type"
                value={currentQuestion.type}
                onChange={handleQuestionChange}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] appearance-none"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="questionPoints" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Points
              </label>
              <input
                key="question-points-input"
                type="number"
                id="questionPoints"
                name="points"
                value={currentQuestion.points}
                onChange={handleQuestionChange}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                min="1"
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53]"
                autoComplete="off"
              />
            </div>
          </div>


          {currentQuestion.type === 'multiple-choice' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[#1B3C53] text-sm font-semibold">
                  Answer Options
                </label>
                <Button
                  text="Add Option"
                  onClick={(e) => addOption(e)}
                  className="px-3 py-1 text-xs bg-[#4A8292] text-white hover:bg-[#1B3C53] rounded"
                />
              </div>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      key={`option-checkbox-${index}`}
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked, e)}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-[#4A8292] focus:ring-[#4A8292]"
                    />
                    <input
                      key={`option-text-${index}`}
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value, e)}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF]"
                      autoComplete="off"
                    />
                    {currentQuestion.options.length > 2 && (
                      <Button
                        text="×"
                        onClick={(e) => removeOption(index, e)}
                        className="px-2 py-1 text-sm bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B7280] mt-2">Check the box next to correct answers</p>
            </div>
          )}

          {/* True/False */}
          {currentQuestion.type === 'true-false' && (
            <div>
              <label className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Correct Answer
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="true"
                    checked={currentQuestion.correctAnswer === 'true'}
                    onChange={(e) => handleQuestionChange(e)}
                    onFocus={(e) => e.stopPropagation()}
                    onBlur={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2 accent-[#4A8292]"
                  />
                  <span className="text-[#1B3C53]">True</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="false"
                    checked={currentQuestion.correctAnswer === 'false'}
                    onChange={(e) => handleQuestionChange(e)}
                    onFocus={(e) => e.stopPropagation()}
                    onBlur={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="mr-2 accent-[#4A8292]"
                  />
                  <span className="text-[#1B3C53]">False</span>
                </label>
              </div>
            </div>
          )}

          {/* Short Answer */}
          {currentQuestion.type === 'short-answer' && (
            <div>
              <label htmlFor="correctAnswer" className="block text-[#1B3C53] text-sm font-semibold mb-2">
                Correct Answer
              </label>
              <input
                key="correct-answer-input"
                type="text"
                id="correctAnswer"
                name="correctAnswer"
                value={currentQuestion.correctAnswer}
                onChange={handleQuestionChange}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter the correct answer..."
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF]"
                required
                autoComplete="off"
              />
              <p className="text-xs text-[#6B7280] mt-1">This will be used for automatic grading (case-insensitive)</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-[#E5E7EB] mt-6">
            <Button
              text="Cancel"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleQuestionFormClose(e);
              }}
              className="px-6 py-2 bg-[#E5E7EB] text-[#1B3C53] hover:bg-[#D1D5DB] rounded-md font-medium transition-colors"
              aria-label="Cancel question creation"
            />
            <Button
              text={editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSaveQuestion(e);
              }}
              className="px-6 py-2 bg-[#1B3C53] text-white hover:bg-[#456882] rounded-md font-medium transition-colors shadow-sm"
              aria-label={editingQuestionIndex >= 0 ? 'Update this question' : 'Add this question to the quiz'}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

QuizCreator.propTypes = {
  lectureId: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  onQuizCreated: PropTypes.func.isRequired
};

export default QuizCreator;
