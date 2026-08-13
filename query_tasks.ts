import 'dotenv/config';
import { db } from './lib/db/client';
import { tasks } from './lib/db/schema';

async function main() {
  const allTasks = await db.select().from(tasks);
  console.log('Total tasks in DB:', allTasks.length);
  console.table(allTasks.map(t => ({
    title: t.title,
    isActive: t.isActive,
    rankRequired: t.rankRequired,
    difficulty: t.difficulty,
  })));
  process.exit(0);
}
main();
