import { useState, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';

export function VoiceInput({ onTranscript, disabled }) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!isSupported) {
            alert("Voice input is not supported in this browser. Please try Chrome or Edge.");
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        setIsListening(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            stopListening();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            stopListening();
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        window.currentRecognition = recognition;
    };

    const stopListening = () => {
        if (window.currentRecognition) {
            window.currentRecognition.stop();
            window.currentRecognition = null;
        }
        setIsListening(false);
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            className={`
                p-2 rounded-lg transition-all duration-200 active:scale-95
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                ${isListening
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 animate-pulse'
                    : 'text-gray-500 dark:text-gray-400'}
            `}
            onClick={toggleListening}
            disabled={disabled}
            title={isListening ? "Stop listening" : "Start voice input"}
        >
            {isListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
        </button>
    );
}
