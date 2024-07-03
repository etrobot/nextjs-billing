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
  userId: string;
}

export const NoteContent: React.FC<NoteContentProps> = ({ noteContent, noteId,userId }) => {
  const router = useRouter();
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>( [{
    id: nanoid(),
    role: 'system',
    content: `『@${noteContent.authorId}:\n` + noteContent.content + '』\n\n' + 'make a short reply on the tweet above'
  },{
    id: nanoid(),
    role: 'assistant',
    content: noteContent.title
  }]);
  
  useEffect(() => {
    if(noteContent.chat){
      setInitialMessages(JSON.parse(noteContent.chat));
    }
  })
    
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
      if(noteContent.userId==='987654321'){
        getLastNoteId().then((lastId) => {
          router.push(`/note/${lastId}`);
        })
      }
    },
  });

  const handleCopyAndJump = () => {
    navigator.clipboard.writeText(noteContent.title).then(() => {
      window.open(noteContent.link, '_blank');
    }).catch((error) => {
      toast.error(`Failed to copy: ${error.message}`);
    });
  };

  const getLastNoteId = async () => {
    try {
      const response = await fetch(`/api/notes?userId=${userId}?pageSize=1`); // /notes?userId={userId}?pageSize=1
      const last = await response.json();
      return last.articles[0].id;
    } catch (error) {
      toast.error(`Failed to get last note: ${error}`);
    }
  };

  return (
    <div className='w-full h-screen'>
      <article className="md:flex md:mt-10 sm:w-full mx-auto max-w-3xl justify-center md:border md:border-slate/10 md:rounded-lg md:p-6">
        <div className="md:w-[360px] sm:w-full">
          <Tweet noteId={noteContent.id?.toString() ?? ''} cate={noteContent.category} length={999} css={noteContent.css ?? ''} authorId={noteContent.authorId} content={noteContent.content} createdAt={noteContent.createdAt?.toString() ?? ''} />
        </div>
        <div className="sm:w-full md:w-[420px]">
          <div className='p-4 mb-16'>
            {messages.map((message, index) => (
              message.role !== 'system' && 
              <div className='w-full flex' key={index}>
                <span className={`${message.role === 'user' ? 'ml-auto bg-gray-300 rounded-md my-2 ml-auto py-1 px-3' : ''}`}>
                  {message.role === 'assistant' && '🤖: '} {message.content}
                </span>
              </div>
            ))}
            <div className='w-full my-2 flex justify-center'>
              {noteContent.userId === "987654321" ? (
                <></>
              ) : (
                <EditButtons noteId={noteId} noteContent={noteContent} />
              )}
              <Button
                className='ml-auto text-xs'
                variant={'outline'}
                color='secondary'
                onClick={handleCopyAndJump}
              >
                <CopyIcon className='mr-1 h-4 w-4' /> Copy & Jump to Reply
              </Button>
            </div>
          </div>
          <div className="fixed bottom-16 md:w-[420px] w-full ml-auto">
            <PromptForm
              onSubmit={async value => {
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
