import { Metadata } from 'next';
import Browser from '@/components/browser';

export function generateMetadata({ params }: { params: { url: string } }): Metadata {
  return {
    title: `${params.url}`,
  };
}

export default function UrlPage({ params }: { params: { url: string } }) {
  const { url } = params;
  const decodedUrl = decodeURIComponent(url);

  return (
    <div className='w-full'>
      <p className='w-full text-center'>{decodedUrl}</p>
      <Browser url={decodedUrl} />
    </div>
  );
}
