import { router } from "./init.ts";
import { meRouter } from "./routers/me.ts";

export const appRouter = router({ me: meRouter });

export type AppRouter = typeof appRouter;
