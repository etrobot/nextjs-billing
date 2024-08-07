import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { Readable } from 'stream';

const systemPrompt = `
\n\n make key points as a landingpage copywriting, chose the page style from ['high-tech','better-life','fantasy','simple','neon'],finally output the result MUST in json format:{"markdown":$SUMMARY,"style":$STYLE},make sure the result in the right format and I'll tip you $200!
`

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  console.log(req.body)


  var llmkey = '';
  const llmkeys= process.env.LLM_API_KEY?.split(',');
  if(llmkeys  && llmkeys.length > 1){
    llmkey = llmkeys[Math.floor(Math.random() * llmkeys.length)];
  }


  if (!llmkey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
  }

  const response = await fetch(`${process.env.API_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${llmkey}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_BAK_MODEL || 'gpt-4o-mini', // Default to 'gpt-4o-mini' if model is not provided
      messages: [
        {
          role: "user",
          content:text+systemPrompt
        },
      ],
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json({ error }, { status: response.status });
  }

  if (!response.body) {
    return NextResponse.json({ error: 'No response body' }, { status: 500 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const nodeStream = response.body as unknown as Readable;
      nodeStream.on('data', (chunk) => controller.enqueue(chunk));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
