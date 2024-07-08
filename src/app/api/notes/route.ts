import { NextResponse } from 'next/server';
import { sqliteDb, note, NewArticle as Article } from '@/db/schema-sqlite';
import { desc, sql, eq, and } from 'drizzle-orm';
import { auth } from '@/auth';


export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const startCursor = parseInt(searchParams.get('startCursor') ?? '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const category = searchParams.get('category');
  const authorId = searchParams.get('authorId');
  
  try {
    // Base conditions
    let conditions = [];
    if (searchParams.get('userId')) {
      const session = await auth();
      if(session){
        conditions.push(eq(note.userId, session.user.id));
      }else{
        return NextResponse.json({ error: 'auth error' }, { status: 401 })
      }
    }else{
      conditions.push(eq(note.userId, '987654321'));
    }
    // Add category condition if category parameter is present
    if (category) {
      conditions.push(eq(note.category, category));
    }

    if (authorId) {
      console.log(authorId);
      conditions.push(eq(note.authorId, authorId));
    }

    // Construct the query with conditions
    const articlesQuery = await sqliteDb
      .select({
        id: note.id,
        link: note.link,
        userId: note.userId,
        title: note.title,
        category: note.category,
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

      const articles: Article[] = articlesQuery.map((article) => ({
        id: article.id,
        link: article.link,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        css: article.css,
        createdAt: article.createdAt,
        useCount: article.useCount ?? 0,
        userId: article.userId, // Add the userId property with appropriate value
        category: article.category, // Add the category property with appropriate value
        tags: '',
        dark: 0,
        textalign: 0,//0:left,1:middle,2:right
        inspiration: '',
        updatedAt: null,
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
