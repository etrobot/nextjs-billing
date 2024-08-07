'use client';

import React, { useEffect, useState } from 'react';
import Coding, {Message} from '@/components/coding'; 

interface BrowserProps {
  url: string;
}

const Browser = ({ url }: BrowserProps) => {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://r.jina.ai/' + url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text();
        setData(text);
        setInitialMessages([{ role: 'user', content: text + ' convert to a landing page' }]);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, [url]);

  if (error) {
    return <div>请求出错: {error}</div>;
  }

  if (data) {
    return (
      <div>
        <h2>请求的内容:</h2>
        <pre>{data}</pre>
        <Coding initialMessages={initialMessages} />
      </div>
    );
  }

  return <div>加载中...</div>;
};

export default Browser;
