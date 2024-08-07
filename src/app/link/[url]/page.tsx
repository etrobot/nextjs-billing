import { Metadata } from 'next';
import Browser from '@/components/browser';

export function generateMetadata({ params }: { params: { url: string } }): Metadata {
  return {
    title: `输入的URL是：${params.url}`,
  };
}

export default function UrlPage({ params }: { params: { url: string } }) {
  const { url } = params;
  const decodedUrl = decodeURIComponent(url);

  return (
    <div>
      <h1>输入的URL是：</h1>
      <p>{decodedUrl}</p>

      {/* 使用 Browser 组件 */}
      <Browser url={decodedUrl} />
    </div>
  );
}
