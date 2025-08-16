import { useState, useEffect, useCallback } from "react";

import { useLLM } from "./hooks/useLLM";

import LandingScreen from "./components/LandingScreen";
import ProgressScreen from "./components/ProgressScreen";
import ErrorScreen from "./components/ErrorScreen";
import MonologueGenerator from "./components/MonologueGenerator";

export default function App() {
  const llm = useLLM();

  const [appState, setAppState] = useState<"landing" | "loading" | "main" | "error">(
    navigator.gpu ? "landing" : "error",
  );
  const [error, setError] = useState<string | null>(null);
  
  // Log initial state
  useEffect(() => {
    console.log(`[App] Initial state: ${navigator.gpu ? "landing" : "error (no WebGPU)"}`);
    console.log(`[App] Note: Model is cached across refreshes, but generated content is cleared`);
  }, []);

  const handleLoadApp = async () => {
    console.log("[App] Loading app, transitioning to loading state");
    setAppState("loading");
    llm.load();
  };

  const handleLoadingComplete = useCallback(() => {
    console.log("[App] Loading complete, transitioning to main state");
    setAppState("main");
  }, []);

  const handleRetry = () => {
    console.log("[App] Retrying after error");
    setError(null);
    handleLoadApp();
  };

  useEffect(() => {
    if (llm.error) {
      console.error(`[App] LLM error detected: ${llm.error}`);
      setError(`LLM Error: ${llm.error}`);
      setAppState("error");
    } else if (llm.isReady) {
      console.log("[App] LLM is ready");
      handleLoadingComplete();
    }
  }, [llm.isReady, llm.error, handleLoadingComplete]);

  useEffect(() => {
    if (!navigator.gpu) {
      console.error("[App] WebGPU not supported in this browser");
      setError("WebGPU is not supported in this browser.");
      setAppState("error");
    } else {
      console.log("[App] WebGPU is supported");
    }
  }, []);

  // Log state changes
  useEffect(() => {
    console.log(`[App] State changed to: ${appState}`);
  }, [appState]);

  return (
    <>
      <div className="h-screen relative overflow-hidden">
        <LandingScreen isVisible={appState === "landing"} onLoad={handleLoadApp} />
        <ProgressScreen isVisible={appState === "loading"} progress={llm.progress} />
        <ErrorScreen isVisible={appState === "error"} error={error} onRetry={handleRetry} />
        <MonologueGenerator
          isVisible={appState === "main"}
          generate={llm.generate}
        />
      </div>
    </>
  );
}
