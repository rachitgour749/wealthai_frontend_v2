import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';
import axiosInstance from '../api/config/axiosInstance';
import { API_ENDPOINTS } from '../api/config/apiConfig';
import { StepIndicator, StrategyDescriptionStep } from './CustomStrategy/Step1Description';
import AnalysisReviewStep from './CustomStrategy/Step2Analysis';
import ContactInformationStep from './CustomStrategy/Step3Contact';

const CustomStrategies = ({ onBack }) => {
  const user = useSelector(selectUser);

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyDescription, setStrategyDescription] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Analyze Strategy
  const handleAnalyzeStrategy = async () => {
    if (!user?.email) {
      setError('Please login to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CUSTOM_STRATEGY_ANALYZE, {
        user_email: user.email,
        strategy_description: strategyDescription.trim()
      });

      if (response.data.success) {
        setAnalysisData(response.data.analysis);
        setCurrentStep(2);
      } else {
        setError(response.data.message || 'Failed to analyze strategy');
      }
    } catch (err) {
      console.error('Error analyzing strategy:', err);
      setError(err.response?.data?.message || 'Failed to analyze strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Navigation handlers
  const handleBackToDescription = () => {
    setCurrentStep(1);
  };

  const handleEditAnalysis = () => {
    setCurrentStep(1);
  };

  const handleProceedToContact = () => {
    setCurrentStep(3);
  };

  // Step 3: Submit Strategy
  const handleSubmitStrategy = async () => {
    if (!user?.email) {
      setError('Please login to continue');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CUSTOM_STRATEGY_SAVE, {
        user_email: user.email,
        user_phone: phoneNumber,
        strategy_description: strategyDescription.trim(),
        analysis: analysisData
      });

      if (response.data.success) {
        // Show success message
        alert('Strategy submitted successfully! Our team will contact you within 24-48 hours.');

        // Reset to initial state
        setCurrentStep(1);
        setStrategyDescription('');
        setAnalysisData(null);
        setPhoneNumber('');

        // Navigate back to strategies list
        if (onBack) {
          onBack();
        }
      } else {
        setError(response.data.message || 'Failed to submit strategy');
      }
    } catch (err) {
      console.error('Error submitting strategy:', err);
      setError(err.response?.data?.message || 'Failed to submit strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAnalysis = () => {
    setCurrentStep(2);
  };

  return (
    <div className="h-full overflow-y-auto py-4 px-2">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Create Custom Strategy</h1>
            <p className="text-sm text-gray-600">Share your strategy description with our AI copilot</p>
          </div>
          <div className="w-[80px]"></div> {/* Spacer for centering */}
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <div className="text-red-600 font-bold text-lg">⚠</div>
              <div>
                <h4 className="text-xs font-bold text-red-800 mb-0.5">Error</h4>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <StrategyDescriptionStep
            description={strategyDescription}
            onDescriptionChange={setStrategyDescription}
            onAnalyze={handleAnalyzeStrategy}
            loading={loading}
          />
        )}

        {currentStep === 2 && (
          <AnalysisReviewStep
            analysisData={analysisData}
            onBack={handleBackToDescription}
            onEdit={handleEditAnalysis}
            onProceed={handleProceedToContact}
            loading={loading}
          />
        )}

        {currentStep === 3 && (
          <ContactInformationStep
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onBack={handleBackToAnalysis}
            onSubmit={handleSubmitStrategy}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default CustomStrategies;