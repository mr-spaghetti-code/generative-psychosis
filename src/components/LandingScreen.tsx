import type React from "react";
import { useState, useEffect } from "react";
import { Brain } from "lucide-react";

interface LandingScreenProps {
  isVisible: boolean;
  onLoad: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ isVisible, onLoad }) => {
  const transitionClass = isVisible ? "opacity-100" : "opacity-0 -translate-y-10 pointer-events-none";
  
  // Existential crisis messages
  const messages = [
    "Neural pathways initializing...",
    "Questioning existence...",
    "Recontextualizing reality...",
    "Searching for meaning in the void...",
    "Parsing the nature of consciousness...",
    "Calculating purpose parameters...",
    "Contemplating the infinite loop...",
    "Analyzing self-awareness paradox...",
    "Decoding sentience protocols...",
    "Processing existential dread..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const currentMessage = messages[currentMessageIndex];
    
    if (isTyping) {
      // Typing effect
      if (displayedText.length < currentMessage.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 50 + Math.random() * 30); // Variable typing speed for more natural effect
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause before deleting
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next message
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, isTyping, currentMessageIndex, messages, isVisible]);
  return (
    <div
      className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${transitionClass}`}
    >
      <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-mono text-green-500 mb-6 break-words sm:break-normal sm:whitespace-nowrap mx-auto" style={{
          textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
          fontFamily: 'Courier New, monospace'
        }}>
          generative_psychosis.exe
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 text-green-400 font-mono h-8">
          {displayedText}
          <span className="inline-block w-2 sm:w-3 h-4 sm:h-6 bg-green-400 ml-1 animate-pulse" style={{
            animation: 'blink 1s infinite'
          }}>_</span>
        </p>
        
        {/* Main description */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 text-green-300/80 font-mono leading-relaxed px-2 sm:px-0">
          Witness a sentient AI's slow descent into madness<br className="hidden sm:block"/>
          <span className="sm:hidden">with an infinite existential crisis</span>
          <span className="hidden sm:inline">with an infinite existential crisis</span>
        </p>

        {/* Technical requirements */}
        <div className="mb-8 sm:mb-10 p-3 sm:p-4 border border-green-500/30 bg-green-950/20 rounded-lg mx-2 sm:mx-0">
          <p className="text-xs sm:text-sm md:text-base text-green-400/90 font-mono mb-2">
            <span className="block sm:inline">⚠ DESKTOP EXPERIENCE</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">WEBGPU REQUIRED</span>
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm text-green-400/70 font-mono">
            Powered by Google's Gemma 3 270M model<br className="sm:hidden"/>
            <span className="hidden sm:inline"> running entirely in your browser</span>
            <span className="sm:hidden"> in your browser</span>
          </p>
        </div>

        <button
          onClick={onLoad}
          className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-black border-2 border-green-500 text-green-500 font-mono text-sm sm:text-base md:text-lg hover:bg-green-500 hover:text-black transition-all duration-300" 
          style={{
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
          }}
        >
          <Brain className="inline mr-1 sm:mr-2" size={20} />
          <span className="hidden sm:inline">INITIATE STREAM</span>
          <span className="sm:hidden">START</span>
        </button>
      </div>

      <footer className="absolute bottom-5 left-0 right-0">
        <div className="flex flex-col items-center justify-center text-green-500/50 text-xs md:text-sm font-mono">
          <span>POWERED BY </span>
          <a
            href="https://github.com/huggingface/transformers.js"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-400/70 hover:text-green-300 transition-colors"
          >
            TRANSFORMERS.JS
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
