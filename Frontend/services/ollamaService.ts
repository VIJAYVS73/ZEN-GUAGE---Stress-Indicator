
import { GameResult, StressAnalysis, Message, AssessmentHistoryItem } from "../types";

const OLLAMA_API_URL = "http://localhost:11434/api";
const MODEL_NAME = "llama3.1:8b"; // Faster than Mistral for chat

const getSystemPrompt = () => `You are ZenGauge, a supportive mindfulness assistant. Be warm, brief, and practical. Offer stress management techniques and encouragement. Keep responses under 100 words.`;

async function queryOllama(endpoint: string, body: any, timeoutMs: number = 8000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(`${OLLAMA_API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Ollama connection failed');
        return await response.json();
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            throw new Error('Request timeout - Ollama is taking too long');
        }
        console.error("Ollama API Error:", error);
        throw error;
    }
}

export const analyzeStress = async (results: GameResult, coords?: { latitude: number, longitude: number }): Promise<StressAnalysis> => {
    try {
        const prompt = `You are analyzing someone's cognitive performance test results. Based on these metrics, provide a stress assessment.

Metrics:
- Reaction Time: ${results.reactionTime}ms (healthy baseline: 250ms)
- Memory Score: ${results.memoryScore}% (healthy baseline: 80%)
- Tapping Speed: ${results.tappingSpeed}taps/sec (healthy baseline: 6tps)
- Accuracy: ${results.accuracy}% (healthy baseline: 90%)

Provide response in this exact JSON format (no markdown, just raw JSON):
{
  "stressLevel": <number 0-100>,
  "summary": "<personalized assessment>",
  "suggestions": [
    {"title": "...", "description": "...", "type": "breathing|physical|mental|environment", "duration": "..."},
    {"title": "...", "description": "...", "type": "breathing|physical|mental|environment", "duration": "..."},
    {"title": "...", "description": "...", "type": "breathing|physical|mental|environment", "duration": "..."}
  ]
}`;

        const data = await queryOllama('/generate', {
            model: MODEL_NAME,
            prompt: prompt,
            system: getSystemPrompt(),
            stream: false
        });

        try {
            const parsed = JSON.parse(data.response);
            return {
                stressLevel: parsed.stressLevel || 50,
                summary: parsed.summary || "Assessment complete.",
                suggestions: parsed.suggestions || [],
                insights: [],
                mapLinks: []
            };
        } catch (parseError) {
            // Fallback parsing if JSON is malformed
            return {
                stressLevel: 50,
                summary: data.response.substring(0, 200),
                suggestions: [],
                insights: []
            };
        }
    } catch (error) {
        console.error("Stress analysis error:", error);
        return {
            stressLevel: 50,
            summary: "Assessment complete. Your stress level appears moderate.",
            suggestions: [],
            insights: []
        };
    }
};

export const getMindsetReport = async (history: AssessmentHistoryItem[]): Promise<string> => {
    if (history.length < 2) return "Complete more assessments to generate a long-term mindset report.";

    const historyData = history.slice(0, 10).map(h => ({
        date: new Date(h.timestamp).toLocaleDateString(),
        stress: h.stressLevel,
        accuracy: h.results.accuracy
    }));

    try {
        const prompt = `Review this mental health assessment history and provide insights:

${JSON.stringify(historyData, null, 2)}

Provide a 3-paragraph report that:
1. Summarizes trends and patterns
2. Identifies what might be helping or hurting
3. Suggests next steps for wellbeing`;

        const data = await queryOllama('/generate', {
            model: MODEL_NAME,
            prompt: prompt,
            system: getSystemPrompt(),
            stream: false
        });
        return data.response;
    } catch (e) {
        return "Mindset report is temporarily unavailable.";
    }
};

export const chatWithAI = async (messages: Message[]): Promise<Message> => {
    // Convert messages to Ollama chat format - only use last 4 messages for context
    const recentMessages = messages.slice(-4);
    const chatMessages = recentMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.content
    }));

    // Throw errors instead of returning error messages to allow fallback
    const data = await queryOllama('/chat', {
        model: MODEL_NAME,
        messages: chatMessages,
        stream: false,
        options: {
            temperature: 0.7,
            num_predict: 150  // Limit response length for speed
        }
    }, 10000);  // 10 second timeout

    return {
        role: 'model',
        content: data.message.content || data.response || "I'm here to support you. How can I help?",
        timestamp: new Date()
    };
};

export const getDailyAffirmation = async (context?: { stressLevel?: number, accuracy?: number }): Promise<string> => {
    const stressLevel = context?.stressLevel || 50;
    
    let contextMessage = "Generate a brief, empowering daily affirmation.";
    if (stressLevel > 70) {
        contextMessage = "Generate a calming, grounding affirmation for someone experiencing high stress.";
    } else if (stressLevel > 50) {
        contextMessage = "Generate an affirmation about building resilience and managing challenges.";
    }

    try {
        const data = await queryOllama('/generate', {
            model: MODEL_NAME,
            prompt: contextMessage,
            system: "Generate a single, powerful affirmation (1-2 sentences). Focus on strength, peace, and self-compassion.",
            stream: false
        });
        return data.response.trim();
    } catch (e) {
        return "You are capable, resilient, and worthy of peace.";
    }
};

export const findRelaxationVideos = async (): Promise<{ title: string, uri: string }[]> => {
    return [
        { title: "10-Min Guided Meditation", uri: "https://www.youtube.com/results?search_query=10+minute+guided+meditation" },
        { title: "Relaxing Music for Stress Relief", uri: "https://www.youtube.com/results?search_query=relaxing+music+stress+relief" },
        { title: "Deep Sleep Meditation", uri: "https://www.youtube.com/results?search_query=deep+sleep+meditation" },
        { title: "Yoga for Relaxation", uri: "https://www.youtube.com/results?search_query=yoga+relaxation" }
    ];
};

export const findNearbySupport = async (coords?: { latitude: number, longitude: number }): Promise<{ title: string, uri: string }[]> => {
    return [
        {
            title: "Find Mental Health Support on Maps",
            uri: `https://www.google.com/maps/search/psychiatrist/@${coords?.latitude || 0},${coords?.longitude || 0},13z`
        },
        {
            title: "Helpline Directory",
            uri: "https://findahelpline.com/"
        },
        {
            title: "Mental Health Resources",
            uri: "https://www.samhsa.gov/find-help"
        }
    ];
};

export const generateZenImage = async (): Promise<string | null> => {
    const FALLBACK_SCENES: Record<string, string> = {
        'default': 'https://images.unsplash.com/photo-1528353518132-13119849add2?auto=format&fit=crop&w=1920&q=80'
    };
    return FALLBACK_SCENES['default'];
};

