
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: The 'LiveSession' type is not exported from "@google/genai".
// It has been removed from the import and a minimal local interface is defined below.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from "@google/genai";
import { VoiceRAG } from '../types';
import { decode, decodeAudioData, encode } from '../services/geminiService';
import XIcon from './icons/XIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';

interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
}

// FIX: Added a minimal interface for LiveSession as it is not exported from the library.
interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: GenAIBlob }): void;
}

interface LiveConversationModalProps {
  rag: VoiceRAG;
  onClose: () => void;
}

const LiveConversationModal: React.FC<LiveConversationModalProps> = ({ rag, onClose }) => {
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING' | 'ERROR'>('IDLE');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const stopSession = useCallback(async () => {
    setStatus('IDLE');
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
        sessionPromiseRef.current = null;
    }

    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        await inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        await outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
        outputAudioContextRef.current = null;
    }

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    setStatus('CONNECTING');
    setTranscript([]);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        if (!process.env.API_KEY) {
            throw new Error("API key not found. Please set the API_KEY environment variable.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const inputAudioContext = inputAudioContextRef.current;
                    if (!inputAudioContext) return;
                    
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;
                    
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: GenAIBlob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                    setStatus('LISTENING');
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        setStatus('SPEAKING');
                        currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        const finalInput = currentInputTranscriptionRef.current;
                        const finalOutput = currentOutputTranscriptionRef.current;
                        
                        setTranscript(prev => [...prev, 
                            { speaker: 'user', text: finalInput },
                            { speaker: 'ai', text: finalOutput }
                        ]);

                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                        setStatus('LISTENING');
                    }
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                         const outputAudioContext = outputAudioContextRef.current;
                        if (!outputAudioContext) return;

                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Session error:", e);
                    setError("A session error occurred. Please try again.");
                    setStatus('ERROR');
                    stopSession();
                },
                onclose: (e: CloseEvent) => {
                    console.log("Session closed.");
                    // No need to call stopSession here as it will have been called already
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: rag.voice } } },
                systemInstruction: rag.systemInstruction,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
        await sessionPromiseRef.current;
    } catch (e) {
        console.error("Failed to start session:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred. Please check console for details.");
        setStatus('ERROR');
    }
  }, [rag, stopSession]);

  useEffect(() => {
    return () => {
        stopSession();
    };
  }, [stopSession]);
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleMainButtonClick = () => {
    if (status === 'IDLE' || status === 'ERROR') {
        startSession();
    } else {
        stopSession();
    }
  };

  const getStatusText = () => {
    switch(status) {
        case 'IDLE': return 'Ready to start';
        case 'CONNECTING': return 'Connecting...';
        case 'LISTENING': return 'Listening...';
        case 'SPEAKING': return 'Speaking...';
        case 'ERROR': return 'Error occurred';
    }
  }

  const isSessionActive = status === 'LISTENING' || status === 'SPEAKING' || status === 'CONNECTING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" role="dialog" aria-modal="true">
      <div className="flex flex-col w-full max-w-2xl h-[90vh] max-h-[700px] bg-surface rounded-3xl shadow-xl border border-outline-variant m-4">
        <header className="flex items-center justify-between p-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative">
                <img src={rag.avatarUrl} alt={rag.name} className="w-10 h-10 rounded-lg object-cover border-2 border-outline flex-shrink-0" />
                {status === 'SPEAKING' && <div className="absolute -inset-0.5 rounded-lg ring-2 ring-primary animate-pulse"></div>}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-medium text-on-surface truncate">{rag.name}</h2>
              <p className="text-xs text-on-surface-variant truncate">{getStatusText()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-white/10 transition-colors" aria-label="Close chat">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          {transcript.map((entry, index) => (
            <div key={index} className={`flex gap-2.5 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl ${entry.speaker === 'user' ? 'bg-primary-dark text-primary-light rounded-br-lg' : 'bg-tertiary text-on-surface rounded-bl-lg'}`}>
                <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
              </div>
            </div>
          ))}
          {transcript.length === 0 && !isSessionActive && (
            <div className="text-center text-on-surface-variant pt-20">
              <p>Click the microphone to start the conversation.</p>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </main>
        
        {error && <p className="text-sm text-red-400 px-6 pb-2" role="alert">{error}</p>}

        <footer className="p-4 border-t border-outline-variant flex-shrink-0 flex flex-col items-center justify-center">
            {/* FIX: Moved animation logic to the button and removed the invalid conditional from the MicrophoneIcon to fix a TypeScript error and improve UX. */}
            <button 
                onClick={handleMainButtonClick}
                className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 text-white ${isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-light'} ${status === 'LISTENING' ? 'animate-pulse' : ''}`}
                aria-label={isSessionActive ? 'Stop Conversation' : 'Start Conversation'}
            >
                {isSessionActive ? (
                    <StopIcon className="w-8 h-8"/>
                ) : (
                    <MicrophoneIcon className="w-10 h-10" />
                )}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default LiveConversationModal;
