import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { submitAssignment, getAssignmentSubmission } from '../../services/api';
import Loader from '../common/Loader';
import Button from '../common/Button';

function AssignmentComponent({ lectureId, onAssignmentComplete, showModal }) {
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSubmission = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssignmentSubmission(lectureId);
      setMySubmission(data.submission);
      setSubmissionText(data.submission.submissionText || '');
      setSubmissionUrl(data.submission.submissionUrl || '');
      onAssignmentComplete(true);
    } catch (err) {
      setError(err.message || "No submission found or failed to load.");
      setMySubmission(null);
      onAssignmentComplete(false); 
    } finally {
      setLoading(false);
    }
  }, [lectureId, onAssignmentComplete]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!submissionText.trim() && !submissionUrl.trim()) {
      setError("Please provide either text or a URL for your submission.");
      setSubmitting(false);
      return;
    }

    try {
      const data = await submitAssignment(lectureId, { submissionText, submissionUrl });
      setMySubmission(data.submission);
      onAssignmentComplete(true);
      showModal({
        isOpen: true,
        title: "Submission Successful!",
        message: mySubmission ? "Your assignment has been resubmitted." : "Your assignment has been submitted.",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Failed to submit assignment.");
      showModal({
        isOpen: true,
        title: "Submission Failed",
        message: err.message || "Failed to submit assignment.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !mySubmission) return <div className="text-accent-error text-center p-md text-lg">{error}</div>;

  return (
    <div className="bg-background-card p-md rounded-lg shadow-sm border border-gray-100 font-sans">
      <h3 className="text-2xl font-bold text-text-primary mb-md">Assignment Submission</h3>
      {mySubmission && (
        <div className="mb-md p-md bg-background-main rounded-md border border-gray-200">
          <h4 className="font-semibold text-lg text-text-primary mb-sm">Your Current Submission:</h4>
          {mySubmission.submissionText && <p className="text-text-secondary mb-1">Text: {mySubmission.submissionText}</p>}
          {mySubmission.submissionUrl && <p className="text-text-secondary mb-1">URL: <a href={mySubmission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-primary-main hover:underline">{mySubmission.submissionUrl}</a></p>}
          {mySubmission.grade !== null && <p className="text-text-primary font-bold">Grade: {mySubmission.grade}/100</p>}
          {mySubmission.feedback && <p className="text-text-secondary text-sm">Feedback: {mySubmission.feedback}</p>}
          <p className="text-xs text-text-secondary mt-2">Submitted on: {new Date(mySubmission.createdAt).toLocaleDateString()}</p>
          {mySubmission.gradedAt && <p className="text-xs text-text-secondary">Graded on: {new Date(mySubmission.gradedAt).toLocaleDateString()}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="submissionText" className="block text-text-primary text-sm font-semibold mb-2">
            Submission Text (Optional):
          </label>
          <textarea
            id="submissionText"
            rows="5"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
            placeholder="Type your assignment here..."
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="submissionUrl" className="block text-text-primary text-sm font-semibold mb-2">
            Submission URL (Optional):
          </label>
          <input
            type="url"
            id="submissionUrl"
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
            placeholder="e.g., https://docs.google.com/document/d/..."
            disabled={submitting}
          />
        </div>
        <Button
          text={mySubmission ? (submitting ? 'Resubmitting...' : 'Resubmit Assignment') : (submitting ? 'Submitting...' : 'Submit Assignment')}
          type="submit"
          className="px-lg py-md"
          disabled={submitting || (!submissionText.trim() && !submissionUrl.trim())}
        />
      </form>
    </div>
  );
}

AssignmentComponent.propTypes = {
  lectureId: PropTypes.string.isRequired,
  onAssignmentComplete: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
};

export default AssignmentComponent;
