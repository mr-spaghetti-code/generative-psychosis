import type React from "react";

interface ProgressScreenProps {
  progress: number;
  isVisible: boolean;
}

const ProgressScreen: React.FC<ProgressScreenProps> = ({ progress, isVisible }) => {
  const transitionClass = isVisible ? "opacity-100" : "opacity-0 pointer-events-none";
  return (
    <div
      className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${transitionClass}`}
    >
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-mono text-green-500 mb-6" style={{
          textShadow: '0 0 5px rgba(34, 197, 94, 0.5)'
        }}>LOADING NEURAL NETWORK...</h2>
        <div className="w-full bg-gray-900 border border-green-500 p-1">
          <div 
            className="bg-green-500 h-4 transition-all duration-300" 
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.7)'
            }} 
          />
        </div>
        <p className="mt-4 text-lg font-mono text-green-400">
          [{progress.toFixed(2)}%] {progress < 100 ? 'PROCESSING' : 'COMPLETE'}
        </p>
      </div>
    </div>
  );
};

export default ProgressScreen;
