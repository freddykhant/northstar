import { router } from "./init.ts";
import { completionRouter } from "./routers/completion.ts";
import { habitRouter } from "./routers/habit.ts";
import { meRouter } from "./routers/me.ts";
import { moodRouter } from "./routers/mood.ts";

export const appRouter = router({
  me: meRouter,
  habit: habitRouter,
  completion: completionRouter,
  mood: moodRouter,
});

export type AppRouter = typeof appRouter;
