'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Tweet from '@/components/tweet';
import type { NewArticle as Article } from '@/db/schema-sqlite';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

function Notes({ userId }: { userId?: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTweets, setSelectedTweets] = useState<Article[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') ?? '';
  const authorId = searchParams?.get('authorId') ?? '';

  const { ref, inView } = useInView({
    threshold: 1.0,
    triggerOnce: false,
  });

  const fetchArticles = useCallback(async (cursor: string | undefined = undefined, category: string = '') => {
    try {
      const res = await fetch(`/api/notes?${cursor ? `startCursor=${cursor}&` : ''}pageSize=16${category ? `&category=${category}` : ''}${userId ? `&userId=${userId}` : ''}${authorId ? `&authorId=${authorId}` : ''}`);
      if (res.status === 401 && userId) {
        router.push('/signin?from=user');
        return
      }
      const data: { articles: Article[]; nextCursor: string; hasMore: boolean } = await res.json();
      setArticles(prev => {
        const newArticles: Article[] = data.articles?.filter(article => !prev.some(a => a.id === article.id));
        return [...prev, ...(newArticles ?? [])];
      });
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    }
  }, [userId, authorId, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/cates');
      const data: string[] = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      void fetchArticles(nextCursor, category);
    }
  }, [inView, nextCursor, hasMore, fetchArticles, category]);

  useEffect(() => {
    void fetchArticles(undefined, category);
  }, [category, fetchArticles]);

  useEffect(() => {
    // Reset articles and cursor when category changes
    setArticles([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, [category]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (newCategory: string) => {
    void router.push(`${userId ? '/user' : ''}?category=${newCategory}`);
  };

  const toggleSelectTweet = (article: Article) => {
    setSelectedTweets(prev => {
      const isSelected = prev.some(tweet => tweet.id === article.id);
      if (isSelected) {
        return prev.filter(tweet => tweet.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  const handleUnselectTweet = (id: string) => {
    setSelectedTweets(prev => prev.filter(tweet => tweet.id !== Number(id)));
  };

  const handleBatchReply = async () => {
    const title = selectedTweets.map(tweet => `to @${tweet.authorId}: ${tweet.title}`).join('<br>');
    const content = selectedTweets.map(tweet => `<p><a href="${tweet.link}">@${tweet.authorId}:</a> ${tweet.content}</p>`).join('');
    try {
      const res = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      if (res.status !== 200) {
        toast.error(`${res.status} ${res.statusText}`);
      }
      if (res.status === 401) {
        router.push('/signin?from=');
        return
      }
      const response = await res.json();
      const noteId = response.noteId;
      router.push(`/note/${noteId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex justify-center p-2 gap-2 sticky top-0 bg-background">
        {['all', ...categories].map(cat => (
          <Button
            key={cat}
            variant={category === (cat === 'all' ? '' : cat) ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(cat === 'all' ? '' : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      {articles.length === 0 && <div className="flex h-[66vh] text-muted-foreground text-xl items-center justify-center py-10">No notes yet</div>}
      <div className="flex flex-col justify-center items-center p-4 gap-12 w-full">
        <div className="max-w-3xl sm:columns-1 md:columns-2 gap-4 mx-auto overflow-hidden relative transition-all">
          {articles.map((article) => (
            <div className="mb-4 z-0 break-inside-avoid-column sm:w-full min-w-sm" key={article.id}>
              <div
                className={`border ${selectedTweets.some(tweet => tweet.id === article.id) ? 'border-primary' : 'border-slate/10'} rounded-lg p-4 flex flex-col items-start gap-3 h-fit cursor-pointer`}
                onClick={() => toggleSelectTweet(article)}
              >
                <Link className="hover:underline text-wrap break-words" href={`/note/${article.id}`}>🤖: {article.title.slice(0, 70) + '...'}</Link>
                <Tweet noteId={article.id?.toString() ?? ''} cate={article.category} length={280} css={article.css ?? ''} authorId={article.authorId} content={article.content} createdAt={article.createdAt?.toString() ?? ''} />
              </div>
            </div>
          ))}
        </div>
        {hasMore && <div ref={ref} className="h-1" />}
      </div>
      {selectedTweets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-1 bg-background border-t border-slate/10">
          <div className="flex flex-wrap gap-2 justify-center v-items-centers mb-16 md:mb-1">
            {selectedTweets.map(tweet => (
              tweet.id &&
              <div
                key={tweet.id}
                className="p-1 bg-secondary rounded-lg relative text-xs"
                onClick={() => handleUnselectTweet(tweet.id?.toString() ?? '')}
              >
                <X className="absolute top-0 right-0 p-1 bg-black rounded-full text-white cursor-pointer" />
                <Tweet noteId={tweet.id.toString()} cate={tweet.category} length={17} css={tweet.css ?? ''} authorId={tweet.authorId} content={tweet.content} />
              </div>
            ))}
            <div>
              <Button  className='w-full my-2' variant="link" onClick={() => setSelectedTweets([])}>clear</Button>
              <Button className='w-full rounded-full text-md text-white' size='icon' onClick={handleBatchReply}>GEN✨</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Notes;
