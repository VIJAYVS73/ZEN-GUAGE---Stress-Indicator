
// TF-IDF + Logistic Regression for text-based stress classification
// This service analyzes user text input (chat messages, journal entries) to classify stress level

const TFIDF_MODEL_KEY = 'zengauge_tfidf_model';
const TEXT_DATA_KEY = 'zengauge_text_training_data';

export interface TextTrainingData {
    text: string;
    stressLevel: number; // 0-100
    timestamp: number;
}

// Simple TF-IDF implementation
class TFIDFVectorizer {
    private vocabulary: Map<string, number> = new Map();
    private idf: Map<string, number> = new Map();
    private maxFeatures = 100;

    fit(documents: string[]) {
        // Build vocabulary
        const wordFreq = new Map<string, number>();
        const docFreq = new Map<string, number>();

        documents.forEach(doc => {
            const words = this.tokenize(doc);
            const uniqueWords = new Set(words);
            
            words.forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            });

            uniqueWords.forEach(word => {
                docFreq.set(word, (docFreq.get(word) || 0) + 1);
            });
        });

        // Select top features by frequency
        const sortedWords = Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.maxFeatures);

        sortedWords.forEach(([word], idx) => {
            this.vocabulary.set(word, idx);
        });

        // Calculate IDF
        const N = documents.length;
        this.vocabulary.forEach((_, word) => {
            const df = docFreq.get(word) || 1;
            this.idf.set(word, Math.log(N / df));
        });
    }

    transform(document: string): number[] {
        const words = this.tokenize(document);
        const vector = new Array(this.vocabulary.size).fill(0);
        
        // Calculate TF
        const wordCount = new Map<string, number>();
        words.forEach(word => {
            if (this.vocabulary.has(word)) {
                wordCount.set(word, (wordCount.get(word) || 0) + 1);
            }
        });

        // Apply TF-IDF
        wordCount.forEach((count, word) => {
            const idx = this.vocabulary.get(word);
            if (idx !== undefined) {
                const tf = count / words.length;
                const idf = this.idf.get(word) || 0;
                vector[idx] = tf * idf;
            }
        });

        return vector;
    }

    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2); // Filter short words
    }

    save() {
        const data = {
            vocabulary: Array.from(this.vocabulary.entries()),
            idf: Array.from(this.idf.entries())
        };
        localStorage.setItem(TFIDF_MODEL_KEY, JSON.stringify(data));
    }

    load(): boolean {
        try {
            const saved = localStorage.getItem(TFIDF_MODEL_KEY);
            if (!saved) return false;

            const data = JSON.parse(saved);
            this.vocabulary = new Map(data.vocabulary);
            this.idf = new Map(data.idf);
            return true;
        } catch (e) {
            console.error('Failed to load TF-IDF model:', e);
            return false;
        }
    }
}

// Logistic Regression implementation
class LogisticRegression {
    private weights: number[] = [];
    private bias = 0;
    private learningRate = 0.01;
    private iterations = 1000;

    fit(X: number[][], y: number[]) {
        const nFeatures = X[0].length;
        this.weights = new Array(nFeatures).fill(0);
        this.bias = 0;

        console.log(`\n${'='.repeat(60)}`);
        console.log('📝 LOGISTIC REGRESSION TRAINING STARTED');
        console.log(`${'='.repeat(60)}`);
        console.log(`📊 Training Samples: ${X.length}`);
        console.log(`🔢 Features (TF-IDF): ${nFeatures}`);
        console.log(`🔄 Iterations: ${this.iterations}`);
        console.log(`📈 Learning Rate: ${this.learningRate}`);
        console.log(`${'='.repeat(60)}\n`);

        // Gradient descent
        for (let iter = 0; iter < this.iterations; iter++) {
            const predictions = X.map(x => this.sigmoid(this.predict(x)));
            
            // Calculate gradients
            const dw = new Array(nFeatures).fill(0);
            let db = 0;

            for (let i = 0; i < X.length; i++) {
                const error = predictions[i] - y[i];
                db += error;
                for (let j = 0; j < nFeatures; j++) {
                    dw[j] += error * X[i][j];
                }
            }

            // Update weights
            for (let j = 0; j < nFeatures; j++) {
                this.weights[j] -= (this.learningRate * dw[j]) / X.length;
            }
            this.bias -= (this.learningRate * db) / X.length;

            // Log progress every 100 iterations
            if (iter % 100 === 0 || iter === this.iterations - 1) {
                // Calculate accuracy
                const correct = predictions.reduce((count, pred, i) => {
                    const predicted = pred > 0.5 ? 1 : 0;
                    const actual = y[i] > 0.5 ? 1 : 0;
                    return count + (predicted === actual ? 1 : 0);
                }, 0);
                const accuracy = (correct / X.length) * 100;
                
                // Calculate MSE
                const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - y[i], 2), 0) / X.length;
                
                const progress = Math.floor((iter / this.iterations) * 20);
                const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
                console.log(`Iter ${iter.toString().padStart(4, '0')}/${this.iterations} [${bar}] Accuracy: ${accuracy.toFixed(2)}% | Loss: ${mse.toFixed(6)}`);
            }
        }

        // Final accuracy calculation
        const finalPredictions = X.map(x => this.sigmoid(this.predict(x)));
        const finalCorrect = finalPredictions.reduce((count, pred, i) => {
            const predicted = pred > 0.5 ? 1 : 0;
            const actual = y[i] > 0.5 ? 1 : 0;
            return count + (predicted === actual ? 1 : 0);
        }, 0);
        const finalAccuracy = (finalCorrect / X.length) * 100;

        console.log(`\n${'='.repeat(60)}`);
        console.log('✅ LOGISTIC REGRESSION TRAINING COMPLETE');
        console.log(`${'='.repeat(60)}`);
        console.log(`🎯 Final Accuracy: ${finalAccuracy.toFixed(2)}%`);
        console.log(`⚖️ Weights Updated: ${this.weights.length} features`);
        console.log(`💾 Model saved to localStorage`);
        console.log(`${'='.repeat(60)}\n`);
    }

    predict(x: number[]): number {
        let sum = this.bias;
        for (let i = 0; i < x.length; i++) {
            sum += this.weights[i] * x[i];
        }
        return sum;
    }

    private sigmoid(z: number): number {
        return 1 / (1 + Math.exp(-z));
    }

    predictProba(x: number[]): number {
        return this.sigmoid(this.predict(x));
    }

    save() {
        const data = { weights: this.weights, bias: this.bias };
        localStorage.setItem(TFIDF_MODEL_KEY + '_lr', JSON.stringify(data));
    }

    load(): boolean {
        try {
            const saved = localStorage.getItem(TFIDF_MODEL_KEY + '_lr');
            if (!saved) return false;

            const data = JSON.parse(saved);
            this.weights = data.weights;
            this.bias = data.bias;
            return true;
        } catch (e) {
            console.error('Failed to load Logistic Regression model:', e);
            return false;
        }
    }
}

// Main text classifier
class TextStressClassifier {
    private vectorizer = new TFIDFVectorizer();
    private classifier = new LogisticRegression();
    private isReady = false;

    async initialize() {
        const tfidfLoaded = this.vectorizer.load();
        const lrLoaded = this.classifier.load();
        
        if (tfidfLoaded && lrLoaded) {
            this.isReady = true;
            console.log('Text classifier loaded from storage');
        } else {
            await this.seedWithSyntheticData();
        }
    }

    async seedWithSyntheticData() {
        const syntheticData: TextTrainingData[] = [
            { text: "I'm feeling overwhelmed anxious stressed can't cope", stressLevel: 85, timestamp: Date.now() },
            { text: "Everything is too much pressure deadline worry panic", stressLevel: 90, timestamp: Date.now() },
            { text: "Nervous tension headache exhausted burnout tired", stressLevel: 80, timestamp: Date.now() },
            { text: "Feeling okay decent manageable normal routine", stressLevel: 40, timestamp: Date.now() },
            { text: "Little stressed but handling it fine working through", stressLevel: 50, timestamp: Date.now() },
            { text: "Some pressure but under control stable balanced", stressLevel: 45, timestamp: Date.now() },
            { text: "Calm relaxed peaceful content happy energized", stressLevel: 10, timestamp: Date.now() },
            { text: "Great day wonderful motivated focused productive", stressLevel: 15, timestamp: Date.now() },
            { text: "Feeling good positive balanced clear minded", stressLevel: 20, timestamp: Date.now() }
        ];

        localStorage.setItem(TEXT_DATA_KEY, JSON.stringify(syntheticData));
        await this.train(syntheticData);
        console.log('Text classifier seeded with synthetic data');
    }

    async train(data: TextTrainingData[]) {
        if (data.length < 5) {
            console.warn('Not enough data to train text classifier');
            return;
        }

        const texts = data.map(d => d.text);
        const labels = data.map(d => d.stressLevel / 100); // Normalize to 0-1

        // Fit TF-IDF
        this.vectorizer.fit(texts);

        // Transform texts to vectors
        const X = texts.map(text => this.vectorizer.transform(text));

        // Train classifier
        this.classifier.fit(X, labels);

        // Save models
        this.vectorizer.save();
        this.classifier.save();

        this.isReady = true;
        console.log('Text classifier trained successfully');
    }

    predict(text: string): number {
        if (!this.isReady) {
            console.warn('Classifier not ready, returning default');
            return 50;
        }

        try {
            const vector = this.vectorizer.transform(text);
            const prediction = this.classifier.predictProba(vector);
            return Math.round(prediction * 100); // Convert to 0-100 scale
        } catch (e) {
            console.error('Prediction failed:', e);
            return 50;
        }
    }

    addTrainingData(text: string, stressLevel: number) {
        const currentData: TextTrainingData[] = JSON.parse(
            localStorage.getItem(TEXT_DATA_KEY) || '[]'
        );

        currentData.push({
            text,
            stressLevel,
            timestamp: Date.now()
        });

        localStorage.setItem(TEXT_DATA_KEY, JSON.stringify(currentData));

        // Retrain if we have enough data
        if (currentData.length >= 10) {
            this.train(currentData);
        }
    }
}

// Singleton instance
export const textClassifier = new TextStressClassifier();

// Initialize on load
textClassifier.initialize();

export const trainTextClassifier = async () => {
    const data: TextTrainingData[] = JSON.parse(
        localStorage.getItem(TEXT_DATA_KEY) || '[]'
    );

    if (data.length < 5) {
        await textClassifier.seedWithSyntheticData();
        return { 
            success: true, 
            message: 'Trained on synthetic stress patterns (add more real data for personalization)',
            dataPoints: 9 
        };
    }

    await textClassifier.train(data);
    return { 
        success: true, 
        message: 'Text classifier trained on your chat history',
        dataPoints: data.length 
    };
};
