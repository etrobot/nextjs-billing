'use client';

import toast, { Toaster } from 'react-hot-toast';
import React, { useEffect, useState, useCallback } from 'react';
import { Message } from '@/components/coding';
import { Textarea } from '@/components/ui/textarea';

interface BrowserProps {
  url: string;
}

const fetchData = async (url: string) => {
  try {
    const response = await fetch('https://r.jina.ai/' + url);
    if (!response.ok) {
      toast.error(`HTTP error! Status: ${response.status}`);
    }
    const text = await response.text();
    toast.success('Fetch success');
    return text;
  } catch (err: any) {
    toast.error(`Error: ${err.message}`);
    return '';
  }
};

const Browser = ({ url }: BrowserProps) => {
  const [reply, setReply] = useState<string>('');
  const [msg, setMsg] = useState<Message[]>([]);

  const handleSendMessage = useCallback(async (text: string) => {
    try {
      const response = await fetch(`/api/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const reader = response.body?.getReader();
      const textDecoder = new TextDecoder();
      let buffer = '';
      let assistantReply = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += textDecoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.trim() === '[DONE]') {
              break;
            }
            if (line.trim().startsWith('data: ')) {
              const content = line.trim().substring(6);
              if (content === '[DONE]') {
                break;
              }
              try {
                const parsedMessage = JSON.parse(content);
                assistantReply += parsedMessage.choices[0].delta.content ?? '';
                setReply(assistantReply);
                if (parsedMessage.choices[0].finish_reason === 'stop') {
                  break;
                }
              } catch (e: any) {
                console.error(`Error parsing JSON: ${e.message}`);
                // If it's not valid JSON, we'll just ignore this line and continue
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error(`Fetch error ${error.message}`);
      }
    }
  }, []);

  useEffect(() => {
    fetchData(url).then((data) => {
        handleSendMessage(data);
    });
  }, [url, handleSendMessage]);

  return (
    <div className='w-full'>
      <Toaster />
      {reply === '' && <p className='w-full text-center mt-2'>Reading URL ...</p>}
      <div>
        <Textarea
          className="w-full m-8 h-[500px]"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Browser;