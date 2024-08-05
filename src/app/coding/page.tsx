'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CodeSnippet {
  language: 'jsx' | 'js' | 'html' | 'tsx';
  code: string;
}

const defaultCode = `export default() => { return <p className='bg-gray-900 h-screen' ></p>;}`

const Coding: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCode, setSelectedCode] = useState(defaultCode);
  const [language, setLanguage] = useState<'jsx' | 'js' | 'html' | 'tsx'>('jsx');
  const [view, setView] = useState<'chat' | 'code'>('code');
  const controllerRef = useRef<AbortController | null>(null);

  const containCode = (content: string): boolean => {
    return content.includes('import') && content.includes('export default')
  }
  const handleSendMessage = async () => {
    setView('chat');
    if (controllerRef.current) controllerRef.current.abort();
    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: userMessage.content }]);
    setInput('');
    setIsStreaming(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch(`/api/coding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      const textDecoder = new TextDecoder();
      let buffer = '';
      let reply = '';

      if (reader) {
        setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: reply }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += textDecoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              try {
                const parsedMessage = JSON.parse(line.trim().substring(6));
                reply += parsedMessage.choices[0].delta.content ?? '';
                setMessages((prevMessages) => [
                  ...prevMessages.slice(0, -1),
                  { role: 'assistant', content: reply },
                ]);
                if (parsedMessage.choices[0].finish_reason === 'stop') {
                  setIsStreaming(false);
                  break;
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      } else {
        setIsStreaming(false);
      }
      if(containCode(reply))setSelectedCode(extractCodeSnippets(reply)[0].code);
      ;
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error('Fetch error:', error);
      setIsStreaming(false);
    }
  };

  const extractCodeSnippets = (content: string): CodeSnippet[] => {
    var snippets: CodeSnippet[] = [];
    if(content.includes('```')){
      const regex = /```(\w+)?\s*([\s\S]*?)```/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const lang = (match[1] || 'jsx') as 'jsx' | 'js' | 'html' | 'tsx';
        snippets.push({ language: lang, code: match[2].trim() });
      }
    }else{
      snippets.push({ language: 'tsx', code: content });
    }
    return snippets;
  };

  const handleCodeSelection = (index: number) => {
    if (messages[index]) {
      const msgc = messages[index].content;
      if(!containCode(msgc)) return
      setSelectedCode(extractCodeSnippets(msgc)[0].code);
    }
  };


  return (
    <div className="flex flex-col h-screen p-2">
      <div className="isolate relative">
        <Sandpack
          template="react"
          theme="dark"
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            editorHeight: 490
          }}
          files={{
            '/App.js': {
              code: selectedCode,
              active: true,
            },
          }}
          customSetup={{
            entry: '/index.js',
            environment: language === 'html' ? 'static' : 'create-react-app',
          }}
        />
        {view === 'chat' && (
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-slate-900 text-white opacity-80 p-2 z-10 overflow-y-auto">
            {messages.map((message, index) => (
              <div className="w-full flex" key={index}>
                <div
                  className={message.role === 'user' ? 'ml-auto bg-blue-500 rounded-sm p-2 max-w-xs' : `bg-zinc-700 rounded-sm my-2 p-2 cursor-pointer ${containCode(message.content)?'hover:underline':''}`}
                  onClick={() => handleCodeSelection(index)}
                  dangerouslySetInnerHTML={{
                    __html: containCode(message.content) ? `<span>📟 Code Snippet ${(index + 1) / 2}</span>`:message.content
                  }}
                >
                </div>
              </div>
            ))}
          </div>
        )}
        {isStreaming && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-background items-center justify-center z-10">
            Generating...
          </div>
        )}
      </div>
      <div className="flex justify-center my-2">
        <label className="mr-4">
          <input
            type="checkbox"
            name="view"
            value="chat"
            checked={view === 'chat'}
            onChange={() => setView(view === 'chat' ? 'code' : 'chat')}
          /> Show Chat
        </label>
      </div>
      <div className="fixed bottom-0 items-center mb-2 w-full px-2">
        <div className="flex items-center w-full">
          <button
            onClick={() => { controllerRef?.current?.abort(); setMessages([]); setIsStreaming(false);setView('code');setSelectedCode(defaultCode);}}
            className="p-2 border border-gray-500 rounded mr-2"
          >
            New
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage();
                e.preventDefault();
              }
            }}
            className="flex-1 p-2 border border-gray-500 rounded w-full mr-2"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 border border-gray-500 rounded mr-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coding;