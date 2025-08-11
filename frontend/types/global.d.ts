interface Window {
  webkitSpeechRecognition: any;
  webkitSpeechGrammarList: any;
  webkitSpeechRecognitionEvent: any;
}

declare var webkitSpeechRecognition: { 
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare var webkitSpeechGrammarList: {
  prototype: SpeechGrammarList;
  new (): SpeechGrammarList;
};

declare var webkitSpeechRecognitionEvent: {
  prototype: SpeechRecognitionEvent;
  new (): SpeechRecognitionEvent;
};

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

type SpeechRecognitionErrorCode = 
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";