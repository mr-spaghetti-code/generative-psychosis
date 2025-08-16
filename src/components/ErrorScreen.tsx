import type React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorScreenProps {
  isVisible: boolean;
  error: string | null;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ isVisible, error, onRetry }) => {
  const transitionClass = isVisible ? "opacity-100" : "opacity-0 -translate-y-10 pointer-events-none";
  return (
    <div
      className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${transitionClass}`}
    >
      <div className="text-center p-4 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-mono mb-6 text-red-500" style={{
          textShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
        }}>
          <AlertTriangle className="inline-block h-16 w-16 md:h-20 md:w-20 mb-4" />
          <br />
          SYSTEM ERROR
        </h1>
        {error && (
          <div className="bg-gray-900 border border-red-500 text-red-400 px-4 py-3 mb-8 text-left font-mono text-sm">
            <strong>ERROR LOG:</strong>
            <span className="block mt-2">{error}</span>
          </div>
        )}
        <button 
          onClick={onRetry} 
          className="px-8 py-4 bg-black border-2 border-red-500 text-red-500 font-mono text-lg hover:bg-red-500 hover:text-black transition-all duration-300"
          style={{
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
          }}
        >
          [RETRY]
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;
