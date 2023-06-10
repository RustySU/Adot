import Koa, {Context} from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import impAndClick from './pointOfInterest';

const router = new Router();
const app = new Koa();

// Route for adding points of interest and processing events
router.post('/points_of_interest', async (ctx: Context) => {
  await impAndClick(ctx)
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

export default app;