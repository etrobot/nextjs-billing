import React from 'react';
import { TwitterX } from '@/components/icons/social';
import Link from 'next/link';
import truncate from 'html-truncate';

interface ArticleCardProps {
  css: string;
  noteId: string;
  authorId: string;
  createdAt: string;
  content: string;
  length?: number;
  cate: string
}

const Tweet: React.FC<ArticleCardProps> = ({ css,noteId, authorId, createdAt, content, length,cate }) => {
  return (
    <div className='opacity-88 p-3 bg-gray-400 bg-opacity-10 rounded-sm md:max-w-full'>
      <Link href={`/notes/?authorId=${authorId}`}>
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-2">
          <img
            src={'https://pbs.twimg.com/profile_images/' + css}
            alt="maker"
            height={40}
            width={40}
            className="w-8 h-8 rounded-full object-cover object-top"
          />
          <div className="flex flex-col items-start">
            <p>@{authorId}</p>
            <p className="text-muted-foreground text-xs">
              {createdAt ? `${(new Date(+createdAt * 1000)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} / ` : ''}
               {cate}
            </p>
          </div>
        </div>
        <TwitterX className="w-6 h-6 opacity-50" />
      </div>
      </Link>
      <div className="content-container break-words">
        {length ?  <Link href={`/note/${noteId}`} dangerouslySetInnerHTML={{ __html: truncate(content, length, { ellipsis: '...' }) }} /> :
          <p dangerouslySetInnerHTML={{ __html: content }} />
        }
      </div>
    </div>
  );
}

export default Tweet;
