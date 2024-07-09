'use client'
import React from 'react';
import { TwitterX } from '@/components/icons/social';
import truncate from 'html-truncate';

interface ArticleCardProps {
  css: string;
  noteId: string;
  authorId: string;
  createdAt?: string;
  content: string;
  length?: number;
  cate?: string
}

const Tweet: React.FC<ArticleCardProps> = ({ css, noteId, authorId, createdAt, content, length, cate }) => {
  return (
    <div className='opacity-88 p-3 bg-gray-400 bg-opacity-10 rounded-sm w-full max-w-sm mx-auto'>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <img
            src={css ? 'https://pbs.twimg.com/profile_images/' + css : '/icon.png'}
            alt="maker"
            height={40}
            width={40}
            className="w-8 h-8 rounded-full object-cover object-top"
          />
          <div className="flex flex-col items-start">
            <a href={`/notes/?authorId=${authorId}`}>@{authorId}</a>
            <a className='hover:underline' href={`/note/${noteId}`}>
              <p className="text-muted-foreground text-xs">
                {createdAt && `${(new Date(+createdAt * 1000)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} / `}
                {cate ?? ''}
              </p></a>
          </div>
        </div>
        <TwitterX className="w-6 h-6 opacity-50" />
      </div>
      <div className="content-container break-words min-w-xs sm:max-w-xs dark:opacity-80 text-sm">
        {length ? <p dangerouslySetInnerHTML={{ __html: truncate(content.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1'), length, { ellipsis: '...' }) }} /> :
          <p dangerouslySetInnerHTML={{ __html: content }} />
        }
      </div>
    </div>
  );
}

export default Tweet;
