import { router } from "./init.ts";
import { habitRouter } from "./routers/habit.ts";
import { meRouter } from "./routers/me.ts";

export const appRouter = router({ me: meRouter, habit: habitRouter });

export type AppRouter = typeof appRouter;
