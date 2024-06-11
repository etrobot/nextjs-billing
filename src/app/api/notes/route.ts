import { NextResponse } from 'next/server';
import { sqliteDb, note, favorites,NewArticle} from '@/db/schema-sqlite';
import { desc, sql, eq, and, inArray } from 'drizzle-orm';

interface Article {	
  id: number;	
  title: string;
  useCount: number;
  authorId:string;
  content: string;
  dark: boolean;	
  css: string;	
  createdAt: number;	
}
export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const startCursor = parseInt(searchParams.get('startCursor') ?? '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const category = searchParams.get('category');
  const favorId = searchParams.get('favorId');
  const userId = searchParams.get('userId') ?? '987654321';
  try {
    // Base conditions
    let conditions = [eq(note.userId, userId)];

    // Add category condition if category parameter is present
    if (category) {
      conditions.push(eq(note.category, category));
    }

    let articleIds: number[] = [];
    if (favorId) {
      // Query favorite articles by favorId
      const favoritesQuery = await sqliteDb
        .select({
          articleId: favorites.articleId,
        })
        .from(favorites)
        .where(eq(favorites.userId, favorId));

      articleIds = favoritesQuery.map(fav => fav.articleId);

      // Add condition to filter articles by the favorite article IDs
      if (articleIds.length > 0) {
        conditions.push(inArray(note.id, articleIds));
      } else {
        // If no favorite articles found, return empty result
        return NextResponse.json({
          articles: [],
          nextCursor: null,
          hasMore: false,
        }, { status: 200 });
      }
    }

    // Construct the query with conditions
    const articlesQuery = await sqliteDb
      .select({
        id: note.id,
        userId: note.userId,
        title: note.title,
        dark: note.dark,
        css: note.css,
        createdAt: note.createdAt,
        useCount: note.usedcount,
        content: note.content,
        authorId: note.authorId
      })
      .from(note)
      .where(and(...conditions))
      .orderBy(desc(note.id))
      .limit(pageSize)
      .offset(startCursor);

      const articles: Article[] = articlesQuery.map((article: any) => ({	
        id: article.id,	
        title: article.title,	
        dark: article.dark,	
        content: article.content,
        authorId: article.authorId,
        css: article.css,	
        createdAt: article.createdAt,	
        useCount:article.useCount
      }));

    // Query to get the total number of articles
    const totalArticlesQuery = await sqliteDb
      .select({
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(note)
      .where(and(...conditions));

    const totalArticles = totalArticlesQuery[0].count;
    const hasMore = startCursor + pageSize < totalArticles;

    return NextResponse.json({
      articles,
      nextCursor: hasMore ? startCursor + pageSize : null,
      hasMore,
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
};
