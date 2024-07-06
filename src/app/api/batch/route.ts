import { NextResponse } from 'next/server';
import { sqliteDb, note, NewArticle } from '@/db/schema-sqlite';
import { auth } from '@/auth';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await req.json();
    const userId = session.user.id;

    const newNoteData: Omit<NewArticle, 'id'> = {
      link: '',
      title: '',
      category: '',
      content: data,
      userId: userId,
      authorId: 'Inspilot',
    };

    const [newNoteId] = await sqliteDb.insert(note).values(newNoteData).returning({ id: note.id });

    return NextResponse.json({noteId: newNoteId.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
};
