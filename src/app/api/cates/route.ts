import { NextResponse } from 'next/server';
import { sqliteDb, category } from '@/db/schema-sqlite';

export const GET = async (req: Request) => {
  const cates = await sqliteDb
    .select()
    .from(category);

  const categoryNames = cates.map(cate => cate.category);

  return NextResponse.json(categoryNames, { status: 200 });
};
