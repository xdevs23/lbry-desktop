const { getHtml } = require('./html');
const { generateStreamUrl } = require('../../ui/util/web');
const fetch = require('node-fetch');
const Router = require('@koa/router');
const fs = require('fs');
const path = require('path');

// So any code from 'lbry-redux'/'lbryinc' that uses `fetch` can be run on the server
global.fetch = fetch;

const router = new Router();

function getStreamUrl(ctx) {
  const { claimName, claimId } = ctx.params;

  const streamUrl = generateStreamUrl(claimName, claimId);
  return streamUrl;
}

router.get(`/$/api/content/get`, async (ctx) => {
  const homepage = await fs.readFileSync(path.join(__dirname, '../../custom/content/default.json'), 'utf-8');

  ctx.body = {
    status: 'success',
    data: homepage,
  };
});

router.get(`/$/download/:claimName/:claimId`, async (ctx) => {
  const streamUrl = getStreamUrl(ctx);
  const downloadUrl = `${streamUrl}?download=1`;
  ctx.redirect(downloadUrl);
});

router.get(`/$/stream/:claimName/:claimId`, async (ctx) => {
  const streamUrl = getStreamUrl(ctx);
  ctx.redirect(streamUrl);
});

router.get('*', async (ctx) => {
  const html = await getHtml(ctx);
  ctx.body = html;
});

module.exports = router;
