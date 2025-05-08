import { json } from '@sveltejs/kit';

export async function POST({ request }: { request: Request }): Promise<Response> {
  const requestBody = await request.json();
  const text = requestBody.text;

  const externalResponse = await fetch('http://localhost:3000/dev/command/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio: text, deviceId: "mock_01" })
  });

  if (!externalResponse.ok) {
    return json({ error: '外部APIエラー', status: externalResponse.status }, { status: 502 });
  }

  let responseBody;
  try {
    responseBody = await externalResponse.json();
  } catch (error) {
    console.error('JSONパースエラー:', error);
    return json({ error: '外部APIから無効なJSONが返されました' }, { status: 502 });
  }

  const formattedResponse = {
    command: responseBody.command || 'UNKNOWN',
    displayText: responseBody.displayText || '不明なレスポンスです'
  };

  if (!externalResponse.ok) {
    return json({ error: '転送に失敗しました' }, { status: 502 });
  }

  return json({ status: 'success', formattedResponse });
}
