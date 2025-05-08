<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let transcript = '';
	let isListening = $state(false);
    let isTriggered = $state(false);
    let collectedTranscript = $state('');
    let recentTranscripts: string[] = $state([]);
    let timeoutId: NodeJS.Timeout | null = null;

	onMount(() => {
		if (browser) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'ja-JP';

            console.log('SpeechRecognition:', SpeechRecognition);
            recognition.start();

			recognition.onresult = async (event) => {
                if (!isListening && !isTriggered) return;

                const current = event.results[event.resultIndex];
                transcript = current[0].transcript;

                console.log('Transcript:', transcript);

                if (isTriggered) {
                    collectedTranscript += transcript + ' ';

                    if (timeoutId) clearTimeout(timeoutId);
                    timeoutId = setTimeout(async () => {
                        console.log('音声終了: 収集した音声を送信');
                        await sendToServer(transcript);
                        isTriggered = false;
                        collectedTranscript = '';
                    }, 3000);
                } else {
                    recentTranscripts.push(transcript);
                    setTimeout(() => {
                        recentTranscripts = recentTranscripts.slice(1);
                    }, 5000);

                    if (current.isFinal && transcript.includes('トリガー')) {
                        isTriggered = true;
                        collectedTranscript = '';
                        console.log('トリガー検出: 音声収集を開始');
                    }
                }
            };
		}
	});

	async function sendToServer(text: string) {
		try {
			const response = await fetch('/api/voice', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});
			console.log(await response.json());
		} catch (error) {
			console.error('送信エラー:', error);
		}
	}
</script>

<div>
    <h1>リアルタイムの発言</h1>
    <ul>
        {#each recentTranscripts as line}
            <li>{line}</li>
        {/each}
    </ul>
    <button onclick={() => isListening = !isListening}>
        {isListening ? '停止' : '開始'}
    </button>
</div>
