import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { auth } from '@/auth';
import { sqliteDb, note,NewArticle } from '@/db/schema-sqlite';
import { eq } from 'drizzle-orm';
import { type Subscription } from "@lemonsqueezy/lemonsqueezy.js";
import {
  db,
  plans,
  subscriptions,
  type NewSubscription,
} from "@/db/schema";
export const runtime = 'edge';

//random keys
const llmkeys= process.env.LLM_API_KEY?.split(',');
var llmkey='';
if(llmkeys){
  llmkey=llmkeys[Math.floor(Math.random() * llmkeys.length)];
}
const openai = new OpenAI({
  baseURL: process.env.API_BASE_URL,
  apiKey: llmkey
});

export async function POST(req: Request) {
  const json = await req.json();
  const { messages, id, req_userId } = json; // id is the noteId
  // console.log('Chat request:', json);
  const userId = (await auth())?.user.id;

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    });
  }
  const userSubscriptions: NewSubscription[] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  if (!userSubscriptions.length) {
    return new Response('No subscriptions', {
      status: 400
    });
  }else{
      // Check if the user has an active subscription
      const hasValidSubscription = userSubscriptions.some((subscription) => {
        const status =
          subscription.status as Subscription["data"]["attributes"]["status"];
        return new Response('Subscriptions cancelled/expired/unpaid', {
          status: 400
        });
      });
  }

  const msg = [...messages.slice(0, -1), { role: 'user', content: messages[messages.length - 1].content}];

  const res = await openai.chat.completions.create({
    model: process.env.LLM_BAK_MODEL ?? 'gpt-3.5-turbo',
    messages: msg,
    temperature: 0.7,
    stream: true
  });

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const newmsg=[...msg.slice(1, msg.length), { role: 'assistant', content: completion }];
      const updatedNoteData = {
        title: completion,
        chat: JSON.stringify(newmsg),
        updatedAt: Date.now()
      };
      if (userId==req_userId){
        await sqliteDb
          .update(note)
          .set(updatedNoteData)
          .where(eq(note.id, Number(id)));
      }else{
        const refNote = await sqliteDb
          .select()
          .from(note)
          .where(eq(note.refNoteId, Number(id)))
          .limit(1);
        if (refNote.length > 0) {
          await sqliteDb
            .update(note)
            .set(updatedNoteData)
            .where(eq(note.id, Number(refNote[0].id)));
        }else{
          const existingNote = await sqliteDb
          .select()
          .from(note)
          .where(eq(note.id, Number(id)))
          .limit(1);
      
          const newNoteData = {
            ...existingNote[0],
            title: completion,
            userId: userId,
            chat: JSON.stringify(newmsg),
            refNoteId: id,
            updatedAt: Date.now(),
          };
          delete (newNoteData as NewArticle).id; // Ensure TypeScript knows that id can be deleted
          await sqliteDb.insert(note).values(newNoteData);
        }
      }
    }
  });
  return new StreamingTextResponse(stream);
}
