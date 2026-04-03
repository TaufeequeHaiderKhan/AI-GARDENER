export function speak(text: string, rate: number = 0.85, lang: string = 'en-US') {
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  utterance.lang = lang;

  // Try to find a specific voice for the language
  let voices = window.speechSynthesis.getVoices();
  
  // If voices are empty, try one more time (some browsers need this)
  if (voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }
  
  // Helper to find voice
  const findVoice = (tag: string, preferredName?: string) => {
    const matchingVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').includes(tag.toLowerCase()));
    if (preferredName) {
      const preferred = matchingVoices.find(v => v.name.toLowerCase().includes(preferredName.toLowerCase()));
      if (preferred) return preferred;
    }
    return matchingVoices[0];
  };

  // Find appropriate voice
  const voiceTag = lang.split('-')[0];
  const voice = findVoice(voiceTag, 'google') || findVoice(lang) || findVoice(voiceTag);

  if (voice) {
    console.log(`Speaking using voice: ${voice.name} (${voice.lang})`);
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  // Adjust properties for senior-friendly listening
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}

// Pre-load voices (some browsers load them asynchronously)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Initial call to populate voices
  window.speechSynthesis.getVoices();
  
  // Listen for changes (Chrome/Android often load voices late)
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
