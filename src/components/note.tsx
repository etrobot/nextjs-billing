'use client';

import EditButtons from '@/components/edit-button';
import { useChat, type Message } from 'ai/react';
import { toast } from 'react-hot-toast';
import { PromptForm } from './prompt-form';
import { useRouter } from 'next/navigation';
import { NewArticle } from '@/db/schema-sqlite';
import { Button } from "@/components/ui/button";
import { CopyIcon } from 'lucide-react';
import Tweet from '@/components/tweet';
import { nanoid } from 'nanoid';
import { useState, useEffect } from 'react'

interface NoteContentProps {
  noteContent: NewArticle;
  noteId: number;
  userId?: string
}

export const NoteContent: React.FC<NoteContentProps> = ({ noteContent, noteId, userId }) => {
  const router = useRouter();
  const [initialMessages, setInitialMessages] = useState<Message[]>([{
    id: nanoid(),
    role: 'system',
    content: `『@${noteContent.authorId}:\n` + noteContent.content + '』\n\n' + 'make a short reply on the tweet above'
  }, {
    id: nanoid(),
    role: 'assistant',
    content: noteContent.title
  }]);
  const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
    initialMessages,
    body: {
      id: noteId,
      req_userId: noteContent.userId
    },
    onResponse(response) {
      if (response.status !== 200) {
        toast.error(`${response.status} ${response.statusText}`);
      }
      if (response.status === 400) {
        router.push('/pricing');
      }
    },
    onFinish: () => {
      if (noteContent.userId === '987654321' && userId) {
        getLastNoteId(userId).then((lastId) => {
          router.push(`/note/${lastId}`);
        });
      }
    },
  });

  useEffect(() => {
    if (noteContent.chat) {
      const parsedChat = JSON.parse(noteContent.chat);
      setInitialMessages(parsedChat);
    } else {
      if(noteContent.authorId === 'Inspilot') {
      append({
        id: nanoid(),
        role: 'user',
        content: 'make a extreme short question or praise words to reply every picked tweet and end with an emoji,directily output in html format as <p>to @<a href=TWEET_LINK class="underline">author:</a>REPLY<p>'
        });
      }
    }
  }, [noteContent.chat]);
  const handleCopyAndJump = () => {
    navigator.clipboard.writeText(noteContent.title).then(() => {
      window.open(noteContent.link, '_blank');
    }).catch((error) => {
      toast.error(`Failed to copy: ${error.message}`);
    });
  };

  const getLastNoteId = async (userId: string) => {
    try {
      const response = await fetch(`/api/notes?userId=${userId}&pageSize=1`);
      const last = await response.json();
      return last.articles[0].id;
    } catch (error) {
      toast.error(`Failed to get last note: ${error}`);
    }
  };


  return (
    <div className='w-full h-[70vh]'>
      <article className="md:flex md:mt-10 sm:w-full mx-auto max-w-3xl justify-center md:border md:border-slate/10 md:rounded-lg md:p-6">
        <div className="md:w-[360px] sm:w-full">
          <Tweet noteId={noteContent.id?.toString() ?? ''} cate={noteContent.category} css={noteContent.css ?? ''} authorId={noteContent.authorId} content={noteContent.content} createdAt={noteContent.createdAt?.toString() ?? ''} />
        </div>
        <div className="sm:w-full md:w-[420px]">
          <div className='p-4 mb-16'>
            {messages.map((message, index) => (
              message.role !== 'system' &&
              <div className='w-full flex' key={index}>
                <span
                  className={`${message.role === 'user' ? 'ml-auto bg-blue-500 bg-opacity-20 rounded-md my-2 ml-auto p-1 max-w-xs' : ''}`}
                  dangerouslySetInnerHTML={{ __html: message.role === 'assistant' ? '🤖: ' + message.content.replace(/```/g, '') : message.content }}
                />
              </div>
            ))}
            <div className='w-full my-2 flex justify-center'>
              {noteContent.userId === "987654321" ? (
                <></>
              ) : (
                <EditButtons noteId={noteId} noteContent={noteContent} />
              )}
              {noteContent.link && <Button
                className='ml-auto text-xs text-b'
                variant={'outline'}
                color='secondary'
                onClick={handleCopyAndJump}
              >
                <CopyIcon className='mr-1 h-4 w-4' /> Copy & Jump to Reply
              </Button>}
            </div>
          </div>
          <div className="fixed bottom-16 md:w-[420px] w-full ml-auto">
            <PromptForm
              onSubmit={async value => {
                if (!userId) {
                  router.push(`/signin?from=note/${noteId}`);
                }
                append({
                  role: 'user',
                  content: value
                });
              }}
              input={input}
              isLoading={isLoading}
              setInput={setInput}
            />
          </div>
        </div>
      </article>
    </div>
  );
};
