import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createQuiz, createQuestion, getQuizForInstructor } from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';

function QuizCreator({ lectureId, courseId, onQuizCreated, showModal, token }) {
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

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' }
  ];

  const handleQuizDataChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              name === 'passPercentage' ? Number(value) || 0 :
              value
    }));
  }, []);

  const handleQuestionChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: name === 'points' ? Number(value) || 1 : value
    }));
  }, []);

  const handleOptionChange = useCallback((index, field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    }));
  }, []);

  const addOption = useCallback(() => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  }, []);

  const removeOption = useCallback((index) => {
    if (currentQuestion.options.length > 2) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  }, [currentQuestion.options.length]);

  const handleAddQuestion = useCallback(() => {
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

  const handleEditQuestion = useCallback((index) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  }, [questions]);

  const handleSaveQuestion = useCallback(() => {
    // Validation
    if (!currentQuestion.text.trim()) {
      showModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Question text is required.',
        type: 'error'
      });
      return;
    }

    if (currentQuestion.type === 'multiple-choice') {
      const validOptions = currentQuestion.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        showModal({
          isOpen: true,
          title: 'Validation Error',
          message: 'Multiple choice questions need at least 2 options.',
          type: 'error'
        });
        return;
      }
      
      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        showModal({
          isOpen: true,
          title: 'Validation Error',
          message: 'Please mark at least one correct answer.',
          type: 'error'
        });
        return;
      }
    }

    if (currentQuestion.type === 'short-answer' && !currentQuestion.correctAnswer.trim()) {
      showModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please provide the correct answer for short answer questions.',
        type: 'error'
      });
      return;
    }

    const questionToSave = {
      ...currentQuestion,
      options: currentQuestion.type === 'multiple-choice' ? 
        currentQuestion.options.filter(opt => opt.text.trim()) : []
    };

    if (editingQuestionIndex >= 0) {
      setQuestions(prev => prev.map((q, i) => i === editingQuestionIndex ? questionToSave : q));
    } else {
      setQuestions(prev => [...prev, questionToSave]);
    }

    setShowQuestionForm(false);
  }, [currentQuestion, editingQuestionIndex, showModal]);

  const handleDeleteQuestion = useCallback((index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateQuiz = useCallback(async () => {
    if (!quizData.title.trim()) {
      showModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Quiz title is required.',
        type: 'error'
      });
      return;
    }

    if (questions.length === 0) {
      showModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please add at least one question to the quiz.',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create the quiz first
      const quizPayload = {
        lectureId,
        title: quizData.title,
        description: quizData.description,
        passPercentage: quizData.passPercentage,
        isPublished: quizData.isPublished
      };

      const quizResponse = await createQuiz(quizPayload);
      const quizId = quizResponse.quiz._id;
      setCreatedQuizId(quizId);

      // Create questions for the quiz
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

      showModal({
        isOpen: true,
        title: 'Quiz Created',
        message: 'Quiz and questions created successfully!',
        type: 'success'
      });

      onQuizCreated(quizId);
    } catch (error) {
      console.error('Error creating quiz:', error);
      showModal({
        isOpen: true,
        title: 'Creation Failed',
        message: error.message || 'Failed to create quiz.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [quizData, questions, lectureId, showModal, onQuizCreated]);

  // Memoized close handler for question form
  const handleQuestionFormClose = useCallback(() => {
    setShowQuestionForm(false);
  }, []);

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E7EB] shadow-sm">
      <h3 className="text-2xl font-bold text-[#1B3C53] mb-6">Create Quiz</h3>
      
      {/* Quiz Basic Info */}
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
            placeholder="Enter quiz title..."
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF]"
            disabled={submitting}
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
            placeholder="Enter quiz description..."
            rows="3"
            className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF] resize-vertical"
            disabled={submitting}
          />
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
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53]"
              disabled={submitting}
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
                className="mr-2 accent-[#4A8292] focus:ring-[#4A8292]"
                disabled={submitting}
              />
              Published (Visible to students)
            </label>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="border-t border-[#E5E7EB] pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-[#1B3C53]">Questions ({questions.length})</h4>
          <Button
            text="Add Question"
            onClick={handleAddQuestion}
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
                      onClick={() => handleEditQuestion(index)}
                      className="px-3 py-1 text-xs bg-[#E5E7EB] text-[#1B3C53] hover:bg-[#D1D5DB] rounded"
                      disabled={submitting}
                    />
                    <Button
                      text="Delete"
                      onClick={() => handleDeleteQuestion(index)}
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

      {/* Create Quiz Button */}
      <div className="border-t border-[#E5E7EB] pt-6 mt-6">
        <Button
          text={submitting ? 'Creating Quiz...' : 'Create Quiz'}
          onClick={handleCreateQuiz}
          className="w-full px-6 py-3 bg-[#1B3C53] text-white hover:bg-[#456882] rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-md"
          disabled={submitting || questions.length === 0}
        />
      </div>

      {/* Question Form Modal */}
      <Modal
        key="question-form-modal"
        isOpen={showQuestionForm}
        onClose={handleQuestionFormClose}
        title={editingQuestionIndex >= 0 ? 'Edit Question' : 'Add New Question'}
        type="info"
      >
        <div className="space-y-4">
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
              placeholder="Enter your question..."
              rows="3"
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF] resize-vertical"
              required
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
                min="1"
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53]"
              />
            </div>
          </div>

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple-choice' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[#1B3C53] text-sm font-semibold">
                  Answer Options
                </label>
                <Button
                  text="Add Option"
                  onClick={addOption}
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
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                      className="accent-[#4A8292] focus:ring-[#4A8292]"
                    />
                    <input
                      key={`option-text-${index}`}
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF]"
                    />
                    {currentQuestion.options.length > 2 && (
                      <Button
                        text="×"
                        onClick={() => removeOption(index)}
                        className="px-2 py-1 text-sm bg-[#DC2626] text-white hover:bg-[#B91C1C] rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B7280] mt-2">Check the box next to correct answers</p>
            </div>
          )}

          {/* True/False - no additional options needed */}
          {currentQuestion.type === 'true-false' && (
            <div className="bg-[#F9FAFB] p-3 rounded-md">
              <p className="text-sm text-[#6B7280]">
                Students will see True/False options automatically. The correct answer will be determined by their selection.
              </p>
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
                placeholder="Enter the correct answer..."
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A8292] focus:border-[#4A8292] text-[#1B3C53] placeholder-[#9CA3AF]"
                required
              />
              <p className="text-xs text-[#6B7280] mt-1">This will be used for automatic grading (case-insensitive)</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              text="Cancel"
              onClick={handleQuestionFormClose}
              className="px-4 py-2 bg-[#E5E7EB] text-[#1B3C53] hover:bg-[#D1D5DB] rounded-md font-medium"
            />
            <Button
              text={editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}
              onClick={handleSaveQuestion}
              className="px-4 py-2 bg-[#1B3C53] text-white hover:bg-[#456882] rounded-md font-medium"
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
  onQuizCreated: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired
};

export default QuizCreator;
