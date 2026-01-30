
import * as Gemini from './geminiService';
import * as Ollama from './ollamaService';
import { AssessmentHistoryItem, GameResult, Message, StressAnalysis } from '../types';

// Check if Ollama is available by default, fallback to local Gemini
const isOllamaAvailable = async (): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        return response.ok;
    } catch {
        return false;
    }
};

let useOllama = localStorage.getItem('zengauge_ai_provider') === 'ollama';

export const getProvider = async () => {
    // Check if user has explicitly set provider
    const provider = localStorage.getItem('zengauge_ai_provider');
    if (provider === 'ollama') {
        return Ollama;
    } else if (provider === 'gemini') {
        return Gemini;
    }
    
    // Auto-detect: prefer Ollama if available
    const ollamaRunning = await isOllamaAvailable();
    if (ollamaRunning) {
        localStorage.setItem('zengauge_ai_provider', 'ollama');
        return Ollama;
    }
    
    // Fallback to local Gemini service
    return Gemini;
};

export const setProvider = (provider: 'ollama' | 'gemini') => {
    localStorage.setItem('zengauge_ai_provider', provider);
};

export const analyzeStress = async (results: GameResult, coords?: { latitude: number, longitude: number }): Promise<StressAnalysis> => {
    const provider = await getProvider();
    return await provider.analyzeStress(results, coords);
};

export const getMindsetReport = async (history: AssessmentHistoryItem[]): Promise<string> => {
    const provider = await getProvider();
    return await provider.getMindsetReport(history);
};

export const chatWithAI = async (messages: Message[]): Promise<Message> => {
    const provider = await getProvider();
    
    try {
        // Try the provider with a timeout
        const result = await Promise.race([
            provider.chatWithAI(messages),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Provider timeout')), 12000)
            )
        ]);
        return result;
    } catch (error) {
        const errorMsg = (error as Error).message;
        console.warn('Primary provider failed, trying fallback:', errorMsg);
        
        // If Ollama times out or fails, fall back to instant Gemini
        if (provider === Ollama) {
            console.log('🔄 Ollama slow/unavailable, using instant Gemini fallback');
            try {
                return await Gemini.chatWithAI(messages);
            } catch (fallbackError) {
                // If even Gemini fails, return a helpful message
                return {
                    role: 'model',
                    content: "I'm having trouble processing your message. Please try again with a shorter question.",
                    timestamp: new Date()
                };
            }
        }
        
        // For Gemini provider failures, just return error message
        return {
            role: 'model',
            content: "I'm temporarily unavailable. Please try again in a moment.",
            timestamp: new Date()
        };
    }
};

export const getDailyAffirmation = async (context?: { stressLevel?: number, accuracy?: number }): Promise<string> => {
    const provider = await getProvider();
    return await provider.getDailyAffirmation(context);
};

export const findRelaxationVideos = async (queryType?: string): Promise<{ title: string, uri: string }[]> => {
    const provider = await getProvider();
    return await provider.findRelaxationVideos(queryType);
};

export const findNearbySupport = async (coords: { latitude: number, longitude: number }): Promise<{ title: string, uri: string }[]> => {
    const provider = await getProvider();
    return await provider.findNearbySupport(coords);
};

const FALLBACK_SCENES: Record<string, string> = {
    'Deep Calm': 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1920&q=80', // Mist over water
    'Cosmic Peace': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80', // Starry sky
    'Lush Forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80', // Forest sunlight
    'Desert Stillness': 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1920&q=80', // Desert
    'default': 'https://images.unsplash.com/photo-1528353518132-13119849add2?auto=format&fit=crop&w=1920&q=80' // Zen stones
};

export const generateZenImage = async (mood: string): Promise<string | null> => {
    try {
        // Try the active provider first
        const image = await getProvider().generateZenImage(mood);
        if (image) return image;

        // Fallback if AI returns null (common with Ollama or limited keys)
        // Match partial mood strings to our keys
        if (mood.includes('water') || mood.includes('lake')) return FALLBACK_SCENES['Deep Calm'];
        if (mood.includes('nebula') || mood.includes('colors')) return FALLBACK_SCENES['Cosmic Peace'];
        if (mood.includes('forest') || mood.includes('moss')) return FALLBACK_SCENES['Lush Forest'];
        if (mood.includes('sand') || mood.includes('dunes')) return FALLBACK_SCENES['Desert Stillness'];

        return FALLBACK_SCENES['default'];
    } catch (e) {
        return FALLBACK_SCENES['default'];
    }
};
