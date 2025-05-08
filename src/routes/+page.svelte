<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let transcript = '';
	let isListening = $state(false);
	let isTriggered = $state(false);
	let isSending = $state(false);
	let collectedTranscript = $state('');
	let recentTranscripts: string[] = $state([]);
	let timeoutId: NodeJS.Timeout | null = null;

	let responseText = $state('');

	onMount(() => {
		if (browser) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'ja-JP';

			recognition.start();

			recognition.onresult = async (event) => {
				if (!isListening) return;

				const current = event.results[event.resultIndex];
				transcript = current[0].transcript;

				console.log('Transcript:', transcript);

				if (isTriggered) {
					if (transcript !== '') {
						collectedTranscript = transcript;
					}

					if (timeoutId) clearTimeout(timeoutId);
					timeoutId = setTimeout(async () => {
						console.log('音声終了: 収集した音声を送信');
						await sendToServer(collectedTranscript);
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
		if (isSending) return;

		isSending = true;
		isTriggered = false;

		try {
			const response = await fetch('/api/voice', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});
			const responseData = await response.json();

			if (responseData && responseData.formattedResponse) {
				responseText = JSON.stringify(responseData.formattedResponse, null, 2);
			} else {
				responseText = 'エラーが発生しました。';
			}
		} catch (error) {
			console.error('送信エラー:', error);
		} finally {
            isSending = false;
            collectedTranscript = '';
        }
	}
</script>

<div class="base">
	<div class="header">
        <button onclick={() => (isListening = !isListening)}>
            {isListening ? '停止' : '開始'}
        </button>
        <div class="status">
            <h2>状態：{isListening ? '再生中' : '停止中'}</h2>
            <h2>トリガー：{isTriggered ? '再生中' : '停止中'}</h2>
        </div>
    </div>
	<div>
		<h1>リアルタイムの発言</h1>
		<p>{collectedTranscript}</p>
	</div>
	<div>
		<h1>レスポンス{isSending ? ' ( 送信中 )' : ''}</h1>
		<pre>{responseText}</pre>
	</div>
</div>

<style>
    .base {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100dvw;
        height: 100dvh;
        background-color: #f0f0f0;
        gap: 24px;
    }

    .header {
        width: 600px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .status {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    button:hover {
        background-color: #0056b3;
    }

    h1 {
        font-size: 18px;
        margin-bottom: 10px;
    }
    
    p {
        width: 600px;
        height: 100px;
        overflow: auto;
        font-size: 16px;
        background-color: #fff;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    pre {
        width: 600px;
        height: 300px;
        overflow: auto;
        white-space: pre-wrap;
        font-size: 16px;
        background-color: #dadada;
        border: 2px solid #ccc;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
