import { useState, useCallback } from "react";
import { pipeline, TextStreamer } from "@huggingface/transformers";
import type { TextSplitterStream } from "kokoro-js";

interface LLMState {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  progress: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeneratorType = any; // Transformers.js generator type
type LLMGlobal = { generator: GeneratorType | null };
const g = globalThis as { __LLM?: LLMGlobal };
const __LLM: LLMGlobal = g.__LLM || { generator: null };
g.__LLM = __LLM;

export type generateFn = (
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  onToken?: (token: string) => void,
  splitter?: TextSplitterStream,
  madnessLevel?: number
) => Promise<void>;

export const useLLM = () => {
  const [state, setState] = useState<LLMState>({
    isLoading: false,
    isReady: !!__LLM.generator,
    error: null,
    progress: __LLM.generator ? 100 : 0,
  });

  const load = async () => {
    if (__LLM.generator) {
      console.log("[LLM] Model already loaded, reusing existing instance");
      return __LLM.generator;
    }
    console.log("[LLM] Starting model load...");
    setState((p) => ({ ...p, isLoading: true, error: null, progress: 0 }));
    try {
      const generator = await pipeline("text-generation", "onnx-community/gemma-3-270m-it-ONNX", {
        dtype: "fp32",
        device: "webgpu",
        progress_callback: (item) => {
          if (item.status === "progress" && item.file?.endsWith?.("onnx_data")) {
            console.log(`[LLM] Loading progress: ${item.progress?.toFixed(2)}%`);
            setState((p) => ({ ...p, progress: item.progress || 0 }));
          }
        },
      });
      __LLM.generator = generator;
      console.log("[LLM] Model loaded successfully");
      setState((p) => ({
        ...p,
        isLoading: false,
        isReady: true,
        progress: 100,
      }));
      return generator;
    } catch (error) {
      console.error("[LLM] Failed to load model:", error);
      setState((p) => ({
        ...p,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load model",
      }));
      throw error;
    }
  };

  const generate: generateFn = useCallback(async (messages, onToken, splitter, madnessLevel = 0) => {
    const generator = __LLM.generator;
    if (!generator) {
      console.error("[LLM] Generator not loaded!");
      throw new Error("Model not loaded. Call load() first.");
    }
    
    // Vary the length based on madness level
    const minTokens = madnessLevel > 50 ? 30 : 50;
    const maxTokens = madnessLevel > 70 ? 200 : 150;
    const targetTokens = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;
    
    // Temperature increases with madness (0.7 to 1.5+)
    const baseTemp = 0.7 + (madnessLevel / 100) * 0.8; // 0.7 to 1.5
    const randomVariation = Math.random() * 0.2 - 0.1; // ±0.1
    const temperature = Math.min(1.8, baseTemp + randomVariation);
    
    // Adjust top_p and repetition_penalty based on madness
    const topP = Math.max(0.7, 0.85 - (madnessLevel / 100) * 0.2); // 0.85 to 0.65
    const repetitionPenalty = Math.max(1.0, 1.3 - (madnessLevel / 100) * 0.3); // 1.3 to 1.0
    
    console.log(`[LLM] Generation Request:`, {
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        length: m.content.length
      })),
      totalPromptLength: messages.reduce((sum, m) => sum + m.content.length, 0),
      madnessLevel: madnessLevel,
      parameters: {
        max_new_tokens: targetTokens,
        temperature: temperature.toFixed(2),
        top_p: topP.toFixed(2),
        do_sample: true,
        repetition_penalty: repetitionPenalty.toFixed(2)
      },
      timestamp: new Date().toISOString()
    });
    
    let tokenCount = 0;
    const startTime = Date.now();
    
    try {
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (token: string) => {
          tokenCount++;
          onToken?.(token);
          splitter?.push(token);
        },
      });
      
      await generator(messages, {
        max_new_tokens: targetTokens,  // Variable length for diversity
        do_sample: true,       // Enable sampling for varied output
        temperature: temperature,      // Variable temperature based on madness
        top_p: topP,          // Looser sampling as madness increases
        repetition_penalty: repetitionPenalty, // Less penalty as madness increases
        streamer,
      });
      
      const duration = (Date.now() - startTime) / 1000;
      console.log(`[LLM] Generation Complete:`, {
        tokenCount,
        duration: `${duration.toFixed(2)}s`,
        tokensPerSecond: (tokenCount/duration).toFixed(1),
        success: true,
        timestamp: new Date().toISOString()
      });
      
      splitter?.close();
    } catch (error) {
      console.error("[LLM] Generation failed:", error);
      console.error("[LLM] Error details:", {
        errorType: error?.constructor?.name,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    load,
    generate,
  };
};
