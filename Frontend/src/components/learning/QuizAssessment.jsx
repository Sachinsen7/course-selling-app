import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getQuizForLearner, submitQuizAnswers, getQuizAttempts } from '../../services/api';
import Loader from '../common/Loader';
import Button from '../common/Button';

function QuizAssessment({ quizId, onQuizComplete, showModal }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [attemptResult, setAttemptResult] = useState(null);
  const [pastAttempts, setPastAttempts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const quizData = await getQuizForLearner(quizId);
      setQuiz(quizData.quiz);
      const attemptsData = await getQuizAttempts(quizId);
      setPastAttempts(attemptsData.attempts);

      if (attemptsData.attempts.some(attempt => attempt.passed)) {
        onQuizComplete(true);
      } else {
        onQuizComplete(false);
      }
    } catch (err) {
      setError(err.message || "Failed to load quiz.");
      showModal({
        isOpen: true,
        title: "Quiz Error",
        message: err.message || "Failed to load quiz.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [quizId, onQuizComplete, showModal]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const answersArray = Object.keys(selectedAnswers).map(qId => ({
        questionId: qId,
        userAnswer: selectedAnswers[qId],
      }));
      
     
      if (quiz.questions.length > 0 && answersArray.length !== quiz.questions.length) {
        showModal({
          isOpen: true,
          title: "Missing Answers",
          message: "Please answer all questions before submitting.",
          type: "warning",
        });
        setSubmitting(false);
        return;
      }

      const result = await submitQuizAnswers(quizId, answersArray);
      setAttemptResult(result);
      setPastAttempts(prev => [result, ...prev]);
      
      if (result.passed) {
        onQuizComplete(true);
      } else {
        onQuizComplete(false);
      }
      
      showModal({
        isOpen: true,
        title: result.passed ? "Quiz Passed!" : "Quiz Failed",
        message: `You scored ${result.score.toFixed(2)}%. ${result.passed ? 'Congratulations!' : 'Keep trying!'}.`,
        type: result.passed ? "success" : "error",
      });
    } catch (err) {
      setError(err.message || "Failed to submit quiz.");
      showModal({
        isOpen: true,
        title: "Submission Error",
        message: err.message || "Failed to submit quiz.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-accent-error text-center p-md text-lg">{error}</div>;
  if (!quiz) return <p className="text-text-secondary text-center">Quiz not found.</p>;

  return (
    <div className="bg-background-card p-md rounded-lg shadow-sm border border-gray-100 font-sans">
      <h3 className="text-2xl font-bold text-text-primary mb-md">{quiz.title}</h3>
      {quiz.description && <p className="text-text-secondary mb-md">{quiz.description}</p>}
      
      {attemptResult && (
        <div className={`p-md rounded-md mb-md ${attemptResult.passed ? 'bg-accent-success/10 border-accent-success' : 'bg-accent-error/10 border-accent-error'} border`}>
          <h4 className="font-bold text-lg mb-sm">Last Attempt Result:</h4>
          <p>Score: {attemptResult.score.toFixed(2)}%</p>
          <p>Status: {attemptResult.passed ? 'Passed' : 'Failed'}</p>
        </div>
      )}

      <div className="space-y-md">
        {quiz.questions.map((question) => (
          <div key={question._id} className="border-b pb-md">
            <p className="font-semibold text-text-primary mb-sm">{question.order + 1}. {question.text}</p>
            {question.type === 'multiple-choice' && (
              <div className="space-y-1">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center text-text-secondary">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option.text}
                      checked={selectedAnswers[question._id] === option.text}
                      onChange={() => handleAnswerChange(question._id, option.text)}
                      className="mr-2 accent-primary-main"
                      disabled={submitting}
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            )}
            {question.type === 'true-false' && (
              <div className="space-y-1">
                <label className="flex items-center text-text-secondary">
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value="true"
                    checked={selectedAnswers[question._id] === 'true'}
                    onChange={() => handleAnswerChange(question._id, 'true')}
                    className="mr-2 accent-primary-main"
                    disabled={submitting}
                  />
                  True
                </label>
                <label className="flex items-center text-text-secondary">
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value="false"
                    checked={selectedAnswers[question._id] === 'false'}
                    onChange={() => handleAnswerChange(question._id, 'false')}
                    className="mr-2 accent-primary-main"
                    disabled={submitting}
                  />
                  False
                </label>
              </div>
            )}
            {question.type === 'short-answer' && (
              <input
                type="text"
                value={selectedAnswers[question._id] || ''}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                className="w-full p-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
                placeholder="Your answer"
                disabled={submitting}
              />
            )}
          </div>
        ))}
      </div>
      <Button text={submitting ? 'Submitting...' : 'Submit Quiz'} onClick={handleSubmitQuiz} className="mt-md px-lg py-md" disabled={submitting} />

      {pastAttempts.length > 0 && (
        <div className="mt-xl">
          <h4 className="text-xl font-bold text-text-primary mb-md">Past Attempts</h4>
          <ul className="space-y-sm">
            {pastAttempts.map((attempt, index) => (
              <li key={attempt._id || index} className="bg-background-main p-sm rounded-md border border-gray-100">
                Attempt {attempt.attemptNumber}: Score {attempt.score.toFixed(2)}% - {attempt.passed ? 'Passed' : 'Failed'} on {new Date(attempt.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

QuizAssessment.propTypes = {
  quizId: PropTypes.string.isRequired,
  onQuizComplete: PropTypes.func.isRequired, 
  showModal: PropTypes.func.isRequired,
};

export default QuizAssessment;
