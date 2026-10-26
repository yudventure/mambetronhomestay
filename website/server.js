// Entry file for hosts that start the app with `node server.js`, such as the
// Hostinger Node.js setup when the framework preset is "Other". It serves the
// production build from `npm run build`, the same as `npm start`.
const { createServer } = require('http');
const next = require('next');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`Mambetron Homestay berjalan di port ${port}`);
    });
  })
  .catch((e) => {
    console.error('Situs gagal dijalankan. Pastikan npm run build sudah selesai.', e);
    process.exit(1);
  });
