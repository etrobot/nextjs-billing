'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Tweet from '@/components/tweet';
import type { NewArticle as Article } from '@/db/schema-sqlite';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

function Notes({ userId }: { userId?: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
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
  }, [userId, authorId]);

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

  const handleArticleClick = (id: string) => {
    void router.push(`/note/${id}`);
  };

  const handleCategoryClick = (newCategory: string) => {
    void router.push(`${userId ? '/user' : ''}?category=${newCategory}`);
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
      {articles.length === 0 &&  <div className="flex h-[66vh] text-muted-foreground text-xl items-center justify-center py-10">No notes yet</div>}
      <div className="flex flex-col justify-center items-center p-4 gap-12 w-full">
        <div className="max-w-4xl sm:columns-1 md:columns-2 gap-4 mx-auto overflow-hidden relative transition-all">
          {articles.map((article) => (
            <div className="mb-4 z-0 break-inside-avoid-column sm:w-full min-w-sm" key={article.id}>
              <div className="border border-slate/10 rounded-lg p-4 flex flex-col items-start gap-3 h-fit">
                <Link href={`/note/${article.id}`??'/'}>🤖:  {article.title}</Link>
                <Tweet noteId={article.id?.toString() ?? ''} cate={article.category} length={280} css={article.css ?? ''} authorId={article.authorId} content={article.content} createdAt={article.createdAt?.toString() ?? ''} />
              </div>
            </div>
          ))}
        </div>
        {hasMore && <div ref={ref} className="h-1" />}
      </div>
    </>
  );
}

export default Notes;
