import React, { useState, useEffect, useRef } from 'react';
import { RAG, MemoryMode, Message } from '../types';
import { sendMessageToRAG, sendVoiceQuery } from '../services/geminiService';
import XIcon from './icons/XIcon';
import SendIcon from './icons/SendIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import TrashIcon from './icons/TrashIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import SpeakerIcon from './icons/SpeakerIcon';


interface ChatModalProps {
  rag: RAG;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ rag, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrideModel, setOverrideModel] = useState<string>('auto');
  const [sessionMemoryMode, setSessionMemoryMode] = useState<MemoryMode>(rag.memoryMode);
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = { sender: 'ai', text: `Hello! I am ${rag.name}. How can I assist you today?` };

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(`chatHistory_${rag.id}`);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as Message[];
        // Revoke old blob URLs to prevent memory leaks
        parsedHistory.forEach(msg => {
          if (msg.audioUrl && msg.audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(msg.audioUrl);
          }
        });
        setMessages(parsedHistory.map(msg => ({ ...msg, audioUrl: undefined })));
      } else {
        setMessages([initialMessage]);
      }
    } catch (e) {
      console.error("Failed to parse chat history from localStorage", e);
      setMessages([initialMessage]);
    }
  }, [rag.id, rag.name]);

  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].text !== initialMessage.text)) {
      try {
        // Don't store blob URLs in localStorage
        const storableMessages = messages.map(({ audioUrl, ...rest }) => rest);
        localStorage.setItem(`chatHistory_${rag.id}`, JSON.stringify(storableMessages));
      } catch (e) {
        console.error("Failed to save chat history to localStorage", e);
      }
    }
  }, [messages, rag.id]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendMessageToRAG(rag.id, input);
      const aiMessage: Message = { sender: 'ai', text: responseText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = 'Failed to get a response. Please try again.';
      setError(errorMessage);
      const aiErrorMessage: Message = { sender: 'ai', text: `Sorry, I encountered an error. ${errorMessage}` };
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
        localStorage.removeItem(`chatHistory_${rag.id}`);
        setMessages([initialMessage]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Add a placeholder message
        const userMessage: Message = { sender: 'user', text: '🎤 Voice message' };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const { text, audio } = await sendVoiceQuery(rag.id, audioBlob);
            const audioUrl = URL.createObjectURL(audio);
            const aiMessage: Message = { sender: 'ai', text, audioUrl };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = 'Failed to process voice input. Please try again.';
            setError(errorMessage);
            const aiErrorMessage: Message = { sender: 'ai', text: `Sorry, I encountered an error. ${errorMessage}` };
            setMessages((prev) => [...prev, aiErrorMessage]);
        } finally {
            setIsLoading(false);
        }
        
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Microphone access was denied. Please enable it in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="chat-modal-title">
      <div className="flex flex-col w-full max-w-2xl h-[90vh] max-h-[700px] bg-surface rounded-3xl shadow-xl border border-outline-variant m-4">
        <header className="flex items-center justify-between p-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <img src={rag.avatarUrl} alt={rag.name} className="w-10 h-10 rounded-lg object-cover border-2 border-outline flex-shrink-0" />
            <div className="min-w-0">
              <h2 id="chat-modal-title" className="text-lg font-medium text-on-surface truncate">{rag.name}</h2>
              <p className="text-xs text-on-surface-variant truncate" title={rag.models.map(m => m.name).join(', ')}>
                Using: {rag.models.map(m => m.name).join(', ') || 'Default'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button onClick={handleClearHistory} className="p-2 mr-1 rounded-full text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Clear chat history" aria-label="Clear chat history">
                <TrashIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-white/10 transition-colors" aria-label="Close chat">
                <XIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-2 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl ${
                  msg.sender === 'user' ? 'bg-primary-dark text-primary-light rounded-br-lg' : 'bg-tertiary text-on-surface rounded-bl-lg'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === 'ai' && msg.audioUrl && (
                <button onClick={() => playAudio(msg.audioUrl)} className="p-2 mt-1 rounded-full text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-colors flex-shrink-0" aria-label="Play audio response">
                    <SpeakerIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-tertiary text-on-surface px-4 py-2.5 rounded-2xl rounded-bl-lg">
                <div className="flex items-center space-x-1" aria-label="AI is thinking">
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>
        
        {error && <p className="text-sm text-red-400 px-6 pb-2" role="alert">{error}</p>}

        <footer className="p-4 border-t border-outline-variant flex-shrink-0">
          <form onSubmit={handleSendMessage}>
              <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? "Recording..." : "Type your message..."}
                    className="w-full bg-surface border border-outline text-on-surface rounded-full pl-4 pr-24 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                    disabled={isLoading || isRecording}
                    aria-label="Chat message input"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                        type="button"
                        onClick={handleVoiceClick}
                        disabled={isLoading}
                        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 text-on-surface-variant rounded-full hover:bg-primary/20 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 transition-all ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                    >
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || isRecording}
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all"
                        aria-label="Send message"
                        >
                        <SendIcon className="w-5 h-5" />
                    </button>
                  </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 px-2">
                 <div className="relative flex-shrink-0">
                    <select
                      value={overrideModel}
                      onChange={(e) => setOverrideModel(e.target.value)}
                      className="text-xs bg-surface border border-outline text-on-surface rounded-full pl-3 pr-8 py-1 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                      aria-label="Override model for this message"
                      title="Override model for this message"
                    >
                      <option value="auto">Auto-Route Model</option>
                      {rag.models.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                   <div className="relative flex-shrink-0">
                    <select
                      value={sessionMemoryMode}
                      onChange={(e) => setSessionMemoryMode(e.target.value as MemoryMode)}
                      className="text-xs bg-surface border border-outline text-on-surface rounded-full pl-3 pr-8 py-1 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                      aria-label="Override memory mode for this session"
                      title="Override memory mode for this session"
                    >
                      <option value="session_only">Session Memory</option>
                      <option value="long_term">Long-Term Memory</option>
                      <option value="hybrid">Hybrid Memory</option>
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
              </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatModal;