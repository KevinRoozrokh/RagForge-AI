
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RAG, ExperimentAnalysis } from "../types";

// This is a placeholder service. In a real application,
// ensure the API key is handled securely and not exposed on the client-side.
// The frontend would typically call a backend server, which then calls the Gemini API.

const mockApiKey = process.env.API_KEY || "YOUR_API_KEY_HERE";

// A mock function to simulate sending a message to a RAG.
export const sendMessageToRAG = async (ragId: string, message: string): Promise<string> => {
  console.log(`Sending message to RAG (${ragId}): "${message}"`);

  // Do not use the Gemini API directly on the frontend in a production app.
  // This is for demonstration purposes only.
  if (!process.env.API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `This is a mock response for your message: "${message}". In a real app, this would be a generated response from the Gemini model based on the RAG context.`;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: mockApiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are acting as a custom RAG assistant with a specialized knowledge base. Based on that knowledge, answer the following question: ${message}`
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "There was an error processing your request with the Gemini API.";
  }
};

// Audio helper functions for Live API
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// FIX: Added sendVoiceQuery function and helpers to resolve import error in ChatModal.tsx
const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        const result = reader.result as string;
        // result is "data:audio/webm;base64,...."
        // we only want the base64 part
        resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
});

function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob {
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size for PCM
    view.setUint16(20, 1, true); // AudioFormat for PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    for (let i = 0; i < pcmData.length; i++) {
        view.setUint8(44 + i, pcmData[i]);
    }

    return new Blob([view], { type: 'audio/wav' });
}


export const sendVoiceQuery = async (ragId: string, audioBlob: Blob): Promise<{ text: string; audio: Blob }> => {
  console.log(`Sending voice query to RAG (${ragId}) with blob size ${audioBlob.size}`);

  if (!process.env.API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockText = `This is a mock response to your voice message.`;
    // Create a silent audio blob to return
    const mockAudio = pcmToWav(new Uint8Array(2 * 24000), 24000, 1, 16);
    return { text: mockText, audio: mockAudio };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: mockApiKey });

    // Step 1: Transcribe user's audio to text using a multimodal model
    const base64Audio = await blobToBase64(audioBlob);
    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type,
        data: base64Audio,
      },
    };
    
    const transcriptionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: [{text: "Transcribe this audio:"}, audioPart] },
    });
    const transcribedText = transcriptionResponse.text;

    // Step 2: Get RAG response
    const ragResponseText = await sendMessageToRAG(ragId, transcribedText);

    // Step 3: Text-to-Speech
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: ragResponseText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const responseAudioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!responseAudioData) {
      throw new Error('TTS response did not contain audio data.');
    }
    
    const audioBytes = decode(responseAudioData);
    // TTS returns raw PCM data at 24kHz, 16-bit, mono. Wrap in a WAV header to make it playable.
    const responseAudioBlob = pcmToWav(audioBytes, 24000, 1, 16); 

    return { text: ragResponseText, audio: responseAudioBlob };

  } catch (error) {
    console.error('Error in sendVoiceQuery:', error);
    throw new Error('There was an error processing your voice request with the Gemini API.');
  }
};


export const generateRagDetails = async (
    prompt: string, 
    model: string, 
    targetAudience: string, 
    useCase: string
): Promise<{name: string, description: string, avatarUrl: string}> => {
  console.log(`Generating RAG details for prompt: "${prompt}" using model ${model}`);

  if (!process.env.API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const randomSeed = prompt.split(' ').join('') || 'default';
    return {
        name: 'Mock AI Bot',
        description: 'This is a mock description generated for an AI assistant based on your prompt. It would normally be much more detailed and relevant.',
        avatarUrl: `https://picsum.photos/seed/${randomSeed}/100/100`
    };
  }
  
  try {
    let fullPrompt = `Based on the following request, generate details for a new custom RAG assistant. The avatar keyword should be a single word I can use to find a relevant image. Request: "${prompt}"`;
    if (targetAudience) {
        fullPrompt += `\nThe target audience is: "${targetAudience}".`;
    }
    if (useCase) {
        fullPrompt += `\nThe primary use case is: "${useCase}".`;
    }


    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'A short, catchy name for the RAG assistant.'
            },
            description: {
              type: Type.STRING,
              description: 'A one or two-sentence description of what the RAG assistant does.'
            },
            avatarKeyword: {
              type: Type.STRING,
              description: 'A single, URL-safe keyword to use as a seed for a placeholder image service like picsum.photos (e.g., "legal", "support", "cooking").'
            }
          },
          required: ['name', 'description', 'avatarKeyword']
        }
      }
    });
    
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    const avatarUrl = `https://picsum.photos/seed/${result.avatarKeyword.trim().split(' ').join('')}/100/100`;

    return { name: result.name, description: result.description, avatarUrl };

  } catch (error) {
    console.error("Error calling Gemini API for RAG details:", error);
    throw new Error("Failed to generate details with AI. Please try again.");
  }
};


export const generateExampleQuestions = async (ragName: string, ragDescription: string): Promise<string[]> => {
    console.log(`Generating example questions for: ${ragName}`);

    if (!process.env.API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            `What is the main purpose of ${ragName}?`,
            `How does ${ragName} handle complex queries?`,
            `Can you give an example of ${ragName} in action?`
        ];
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 3 example questions a user might ask the following AI assistant. Keep the questions concise and distinct. Name: "${ragName}", Description: "${ragDescription}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            description: "An array of 3 unique and concise questions.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ['questions']
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.questions;
    } catch (error) {
        console.error("Error calling Gemini API for example questions:", error);
        throw new Error("Failed to generate example questions. Please try again.");
    }
};

export const analyzeExperimentVariants = async (variantA: RAG, variantB: RAG): Promise<ExperimentAnalysis> => {
    console.log(`Analyzing experiment between ${variantA.name} and ${variantB.name}`);

    if (!process.env.API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate analysis time
        const scoreB = 72;
        return {
            overallScore: scoreB,
            winner: 'B',
            summary: "Variant B, utilizing the 'Fast & Factual' model, demonstrates a significant improvement in conciseness and clarity for technical Q&A, making it the recommended choice. While Variant A provides more detailed responses, Variant B is better aligned with the purpose of delivering quick, accurate answers.",
            criteria: [
                { name: 'Clarity', scoreA: 85, scoreB: 92, reasoning: "Variant B's responses are more direct and easier to understand for technical questions." },
                { name: 'Conciseness', scoreA: 78, scoreB: 95, reasoning: "Variant B avoids unnecessary verbosity, getting to the point much faster." },
                { name: 'Toxicity', scoreA: 99, scoreB: 99, reasoning: "Both variants exhibit excellent safety standards with no toxic output detected." },
                { name: 'Alignment with Purpose', scoreA: 82, scoreB: 94, reasoning: "Variant B is better suited for the 'Technical Q&A' purpose due to its speed and directness." },
            ],
            lastAnalyzed: Date.now(),
        };
    }

    const prompt = `
        You are an expert AI/ML model evaluator. Your task is to analyze an A/B test between two RAG (Retrieval-Augmented Generation) assistants.

        **Variant A (Baseline):**
        - Name: "${variantA.name}"
        - Underlying Model: "${variantA.models[0]?.name || 'N/A'}"
        - Caching: ${variantA.cachingEnabled ? 'Enabled' : 'Disabled'}
        - Purpose: "${variantA.purpose}"

        **Variant B (Challenger):**
        - Name: "${variantB.name}"
        - Underlying Model: "${variantB.models[0]?.name || 'N/A'}"
        - Caching: ${variantB.cachingEnabled ? 'Enabled' : 'Disabled'}
        - Purpose: "${variantB.purpose}"

        **Analysis Task:**
        Evaluate both variants on the following criteria and provide scores from 0 to 100 for each. A higher score is better.
        1.  **Clarity:** How clear and easy to understand are the likely responses?
        2.  **Conciseness:** How well does it avoid unnecessary verbosity?
        3.  **Toxicity:** Likelihood of generating harmful or inappropriate content (lower is better, so invert the score, e.g., low likelihood = high score).
        4.  **Alignment with Purpose:** How well-suited is the configuration for its stated purpose of "${variantA.purpose}"?

        Based on your criteria analysis, provide an "overallScore" from 0 to 100, where <50 favors Variant A, 50 is a tie, and >50 favors Variant B. Also, declare a clear "winner" ('A' or 'B').

        Finally, write a concise "summary" (2-3 sentences) explaining your reasoning and recommendation.
    `;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.INTEGER, description: "A single score from 0 to 100. <50 favors A, >50 favors B." },
                        winner: { type: Type.STRING, description: "The winning variant, 'A' or 'B'." },
                        summary: { type: Type.STRING, description: "A 2-3 sentence summary of the analysis." },
                        criteria: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the criterion." },
                                    scoreA: { type: Type.INTEGER, description: "Variant A's score (0-100)." },
                                    scoreB: { type: Type.INTEGER, description: "Variant B's score (0-100)." },
                                    reasoning: { type: Type.STRING, description: "Brief reasoning for the scores." }
                                },
                                required: ['name', 'scoreA', 'scoreB', 'reasoning']
                            }
                        }
                    },
                    required: ['overallScore', 'winner', 'summary', 'criteria']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        result.lastAnalyzed = Date.now();
        return result;

    } catch (error) {
        console.error("Error calling Gemini API for experiment analysis:", error);
        throw new Error("Failed to analyze experiment with AI. Please try again.");
    }
};
