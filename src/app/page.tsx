'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleGenerate = () => {
    if (isValidUrl(inputValue)) {
      router.push(`/link/${encodeURIComponent(inputValue)}`);
    } else {
      toast.error('Please input a valid URL！');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>

      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Please input a URL"
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' }}
        />
        <button
          onClick={handleGenerate}
          style={{ padding: '10px 20px', borderRadius: '4px', background: '#0070f3', color: '#fff', border: 'none' }}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
