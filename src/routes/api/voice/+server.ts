import { json } from '@sveltejs/kit';

export async function POST({ request }: { request: Request }) {
  const { text } = await request.json();
  
  // 外部サーバーへの転送処理
  const externalResponse = await fetch('http://localhost:3000/dev/command/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: text, deviceId: "mock_01" })
  });

  if (!externalResponse.ok) {
    return json({ error: '転送に失敗しました' }, { status: 502 });
  }

  return json({ status: 'success', receivedText: text });
}
