import React from 'react';

// Step Indicator Component
export const StepIndicator = ({ currentStep }) => {
    const steps = [
        { number: 1, title: 'Description', subtitle: 'Describe your strategy' },
        { number: 2, title: 'Analysis', subtitle: 'Review AI analysis' },
        { number: 3, title: 'Contact', subtitle: 'Provide contact info' }
    ];

    return (
        <div className="flex items-center justify-center mb-4 gap-2 md:gap-3">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full font-bold text-xs transition-all ${currentStep === step.number ? 'bg-teal-600 text-white' : currentStep > step.number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {currentStep > step.number ? '✓' : step.number}
                        </div>
                        <div className="hidden md:block">
                            <div className={`text-xs font-semibold ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.title}
                            </div>
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`hidden md:block w-12 h-0.5 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// Strategy Description Step Component
export const StrategyDescriptionStep = ({ description, onDescriptionChange, onAnalyze, loading }) => {
    const charCount = description.length;
    const isValid = charCount >= 50;

    const exampleStrategies = [
        {
            title: "Moving Average Crossover",
            description: "Buy when 50-day MA crosses above 200-day MA, sell on opposite crossover. Use 2% stop loss."
        },
        {
            title: "RSI Mean Reversion",
            description: "Buy when RSI drops below 30, sell when it rises above 70. Trade on daily timeframe with 1:2 risk-reward."
        },
        {
            title: "Breakout Strategy",
            description: "Enter long when price breaks above 20-day high with volume confirmation. Exit at 3% profit or 1.5% loss."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Describe Your Trading Strategy</h2>
                <p className="text-sm text-gray-600">
                    Tell us about your trading approach, indicators, timeframes, and risk management rules.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Strategy Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Example: I use a combination of RSI and MACD indicators on the 1-hour timeframe. I enter long positions when RSI is below 30 and MACD shows bullish crossover. I exit when RSI reaches 70 or after 5% profit. I use a 2% stop loss on all trades..."
                    className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm text-gray-700"
                    disabled={loading}
                />
                <div className="flex justify-between items-center mt-1.5">
                    <span className={`text-xs font-medium ${charCount >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                        {charCount >= 50 ? '✓' : '⚠'} {charCount}/50 characters minimum
                    </span>
                    <span className="text-xs text-gray-500">{charCount} characters</span>
                </div>
            </div>

            {/* Example Strategies */}
            <div className="bg-teal-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-bold text-teal-800 mb-2">💡 Example Strategies</h3>
                <div className="space-y-2">
                    {exampleStrategies.map((example, index) => (
                        <div key={index} className="bg-white rounded-lg p-2 border border-teal-200">
                            <h4 className="text-xs font-bold text-gray-800">{example.title}</h4>
                            <p className="text-xs text-gray-600 mt-0.5">{example.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Language Support Info */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-start gap-2">
                <div className="text-blue-600 text-lg">🌐</div>
                <div>
                    <h4 className="text-xs font-bold text-blue-800 mb-0.5">Multi-language Support</h4>
                    <p className="text-xs text-blue-700">
                        You can describe your strategy in any language - English, Hindi, or any other language you're comfortable with!
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onAnalyze}
                    disabled={!isValid || loading}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${isValid && !loading
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            Analyze Strategy
                            <span>→</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
