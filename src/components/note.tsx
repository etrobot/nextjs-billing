'use client';

import FavorButtons from '@/components/favor-button';
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

interface NoteContentProps {
  noteContent: NewArticle;
  noteId: number;
}

export const NoteContent: React.FC<NoteContentProps> = ({ noteContent, noteId }) => {
  const router = useRouter();
  const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
    initialMessages: [{
      id: nanoid(),
      role: 'system',
      content: `『@${noteContent.authorId}:\n`+noteContent.content+'』\n\n'+'make a short reply on the tweet above'
    },{
      id: nanoid(),
      role: 'assistant',
      content:  noteContent.title
    }],
    body: {
      id: noteId.toString(),
    },
    onResponse(response) {
      if (response.status !== 200) {
        toast.error(`${response.status} ${response.statusText}`);
      }
      if (response.status === 400) {
        router.push('/pricing');
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

  return (
    <div className='w-full h-screen'>
    <article className="md:flex md:mt-10 sm:w-full mx-auto max-w-3xl justify-center border md:border-slate/10 md:rounded-lg md:p-6">
      <div className="md:w-[360px] sm:w-full">
        <Tweet noteId={noteContent.id?.toString() ?? ''} cate={noteContent.category} length={999} css={noteContent.css ?? ''} authorId={noteContent.authorId} content={noteContent.content} createdAt={noteContent.createdAt?.toString() ?? ''} />
      </div>
      <div className="sm:w-full md:w-[420px]">
        <div className='p-4  mb-16'>
        {messages.map((message, index) => (
          message.role !== 'system' && 
          <div className='w-full flex'  key={index}>
          <span className={` ${message.role === 'user' ? 'ml-auto bg-gray-300 rounded-md my-2 ml-auto py-1 px-3' : ''}`}>
            {message.role === 'assistant' && '🤖: '} {message.content}
            </span>
          </div>
        ))}
        <div className='w-full my-2 flex justify-center'>


          <Button
            className='mr-auto text-xs'
            variant={'outline'}
            color='secondary'
            onClick={handleCopyAndJump}
          >
            <CopyIcon className='mr-1 h-4 w-4' /> Copy & Jump to Reply
          </Button>
          {noteContent.userId === "987654321" ? (
            <FavorButtons noteId={noteId} isFavored={true} />
          ) : (
            <EditButtons noteId={noteId} noteContent={noteContent} />
          )}
        </div>
        </div>
        {noteContent.userId != "987654321" && (
          <div className="fixed bottom-16  md:w-[420px] w-full ml-auto">
          <PromptForm
            onSubmit={async (inputValue) => {
              append({
                role: 'user',
                content: inputValue
              });
              setInput('');
              await reload().catch((error) => {
                toast.error(`Reload failed: ${error.message}`);
              });
            }}
            input={input}
            isLoading={isLoading}
            setInput={setInput}
          />
        </div>
        )}
      </div>
    </article>
    </div>
  );
};
