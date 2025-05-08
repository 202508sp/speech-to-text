
declare global {
	namespace App {
	}

	interface Window {
		SpeechRecognition: typeof SpeechRecognition;
		webkitSpeechRecognition: typeof SpeechRecognition;
	}
}

declare class SpeechRecognition {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: (event: SpeechRecognitionEvent) => void;
	start(): void;
	stop(): void;
}

interface SpeechRecognitionEvent {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
	[index: number]: SpeechRecognitionResult;
	length: number;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	[index: number]: SpeechRecognitionAlternative;
	length: number;
}

interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}

export { };
