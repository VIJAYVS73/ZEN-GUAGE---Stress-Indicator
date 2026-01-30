export type SupportedLanguage = 'en' | 'hi';

const STORAGE_KEY = 'zengauge_lang';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    app_name: 'ZenGauge',
    nav_dashboard: 'Dashboard',
    nav_relax_library: 'Relax Library',
    nav_near_me: 'Near Me',
    nav_history: 'Performance',
    nav_chat: 'Mindset AI',
    nav_breathe: 'Quick Calm',
    hero_badge: 'Live Cognition Check',
    hero_title_line1: 'Assess Your Mental',
    hero_title_line2: 'State in 3 Minutes',
    hero_subtitle: 'A high-precision cognitive check-up powered by Advanced AI.',
    hero_start_test: 'Start Test',
    hero_relax_videos: 'Relaxation Videos',
    stats_title: 'Your Stats',
    stats_best_acc: 'Best Acc',
    stats_tests: 'Tests',
    burnout_badge: 'Burnout Risk (ML Forecast)',
    quick_calm_title: 'Quick Calm',
    quick_calm_body: 'Interactive breathing session with ambient nature sounds.',
    affirmation_badge: 'Affirmation of the Day',
    processing_title: 'Processing your results',
    processing_body: 'Connecting with Thinking Engine...',
    cancel_test: 'Cancel Test',
    chat_heading: 'Mindset Support',
    chat_subtitle: 'Grounded AI guidance for stress management.',
    streak_label: 'Active Streak',
    streak_days_suffix: 'Days',
    language_label: 'Language',
  },
  hi: {
    app_name: 'ZenGauge',
    nav_dashboard: 'डैशबोर्ड',
    nav_relax_library: 'आराम लाइब्रेरी',
    nav_near_me: 'मेरे पास',
    nav_history: 'प्रदर्शन',
    nav_chat: 'माइंडसेट एआई',
    nav_breathe: 'त्वरित शांति',
    hero_badge: 'लाइव कॉग्निशन चेक',
    hero_title_line1: 'अपनी मानसिक स्थिति',
    hero_title_line2: '3 मिनट में जाँचें',
    hero_subtitle: 'एडवांस्ड एआई द्वारा संचालित उच्च-सटीकता जाँच।',
    hero_start_test: 'टेस्ट शुरू करें',
    hero_relax_videos: 'रिलैक्सेशन वीडियो',
    stats_title: 'आपके आँकड़े',
    stats_best_acc: 'सर्वश्रेष्ठ सटीकता',
    stats_tests: 'टेस्ट',
    burnout_badge: 'बर्नआउट जोखिम (एमएल पूर्वानुमान)',
    quick_calm_title: 'त्वरित शांति',
    quick_calm_body: 'प्रकृति ध्वनियों के साथ इंटरएक्टिव श्वास सत्र।',
    affirmation_badge: 'आज का संकल्प',
    processing_title: 'आपके परिणाम प्रोसेस हो रहे हैं',
    processing_body: 'थिंकिंग इंजन से कनेक्ट हो रहा है...',
    cancel_test: 'टेस्ट रद्द करें',
    chat_heading: 'माइंडसेट सपोर्ट',
    chat_subtitle: 'तनाव प्रबंधन के लिए स्थिर एआई मार्गदर्शन।',
    streak_label: 'सक्रिय स्ट्रीक',
    streak_days_suffix: 'दिन',
    language_label: 'भाषा',
  },
};

export function loadLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  return stored && (stored === 'en' || stored === 'hi') ? stored : 'en';
}

export function saveLanguage(lang: SupportedLanguage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, lang);
}

export function t(lang: SupportedLanguage, key: string): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

