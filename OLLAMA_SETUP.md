# Ollama Setup Guide for ZEN GAUGE

## Overview
ZEN GAUGE now supports **Ollama** for offline AI conversations with better context awareness and personalized support.

## Installation Steps

### 1. Download and Install Ollama
- Visit: https://ollama.ai
- Download for Windows, Mac, or Linux
- Follow installation instructions

### 2. Start Ollama Service
```bash
# On Windows, Ollama runs as a service automatically after installation
# On Mac/Linux, run:
ollama serve
```

### 3. Pull a Model (Choose One)

**Option A: Mistral (Recommended for conversation)**
```bash
ollama pull mistral
```

**Option B: Llama 2 (Alternative)**
```bash
ollama pull llama2
```

**Option C: Neural Chat (Optimized for chat)**
```bash
ollama pull neural-chat
```

### 4. Verify Installation
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags
```

You should see a JSON response with the models you've pulled.

## How ZEN GAUGE Uses Ollama

1. **Automatic Detection**: The app automatically detects if Ollama is running
2. **Better Conversations**: Uses the full power of AI models for meaningful responses
3. **Offline**: All processing happens locally - no data sent to external servers
4. **Customizable**: Edit model selection in `Frontend/services/ollamaService.ts`

## Features Enabled by Ollama

✅ **Smart Chat**: Context-aware mindfulness conversations  
✅ **Stress Analysis**: Personalized assessment of cognitive performance  
✅ **Daily Affirmations**: AI-generated affirmations based on your stress level  
✅ **Mindset Reports**: Detailed analysis of your wellbeing trends  

## Switching Providers

The app automatically prefers Ollama if available. To manually switch:

In the UI (if provider settings are added):
- Use the "AI Provider" toggle to switch between Ollama and Local

Or in code:
```typescript
import { setProvider } from './services/aiService';

// Use Ollama
setProvider('ollama');

// Use local Gemini service
setProvider('gemini');
```

## Troubleshooting

**Issue**: "I'm having trouble connecting to the local AI"
- **Solution**: Make sure Ollama is running (`ollama serve`)
- Check: `http://localhost:11434/api/tags`

**Issue**: Model not found
- **Solution**: Pull a model first: `ollama pull mistral`

**Issue**: Slow responses
- **Solution**: Larger models are slower but more capable. Try smaller model like `orca-mini` for speed

**Issue**: Out of memory
- **Solution**: Try a smaller model like `orca-mini` (7B) instead of larger ones (13B+)

## Recommended Models for ZEN GAUGE

| Model | Size | Speed | Quality | Command |
|-------|------|-------|---------|---------|
| **mistral** | 7B | Fast | Very Good | `ollama pull mistral` |
| neural-chat | 7B | Fast | Good | `ollama pull neural-chat` |
| llama2 | 7B/13B | Medium | Good | `ollama pull llama2` |
| dolphin-mixtral | 8x7B | Slow | Excellent | `ollama pull dolphin-mixtral` |

## System Requirements

- **CPU**: Modern multi-core processor (4+ cores recommended)
- **RAM**: 8GB minimum (16GB+ recommended for best performance)
- **Disk**: 4-15GB per model (depending on size)
- **GPU** (optional): NVIDIA/AMD GPU for faster inference

## Next Steps

1. Install Ollama from https://ollama.ai
2. Run `ollama pull mistral`
3. Start Ollama service
4. Refresh ZEN GAUGE app
5. Start conversations!

The app will automatically use Ollama for enhanced mindfulness support.
