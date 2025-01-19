// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  constructor() {
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.configureRecognition();
      } else {
        console.warn('Speech recognition is not supported in this browser');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  }

  private configureRecognition() {
    if (!this.recognition) return;

    // Set continuous to true to keep recording
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    // Handle recognition errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // Only stop listening if it's a fatal error
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        this.isListening = false;
      }
    };

    // Restart recognition if it ends unexpectedly
    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition?.start();
        } catch (error) {
          console.error('Error restarting voice recognition:', error);
        }
      }
    };
  }

  public startListening(onResult: (text: string) => void, onError?: (error: string) => void): void {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser');
      return;
    }

    if (this.isListening) return;

    try {
      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        // Send final results
        if (event.results[last].isFinal) {
          onResult(transcript);
        }
      };

      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      if (onError) onError('Error starting voice recognition');
      this.isListening = false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
      this.isListening = false;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }
}

export const voiceService = new VoiceService();
