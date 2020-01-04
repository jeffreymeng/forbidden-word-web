// https://github.com/parcel-bundler/parcel/issues/1315#issuecomment-523524186
// run-parcel.js
const Bundler = require('parcel-bundler');
const express = require('express');

const port = Number(process.env.PORT || 1234);
console.log(`Listening at http://localhost:${port}`);

const bundler = new Bundler(['src/index.html', 'src/game.html', 'src/404.html']);
const app = express();

app.get('/', (req, res, next) => {
  req.url = '/index.html';
  app._router.handle(req, res, next);
});

app.use(bundler.middleware());

app.listen(port);
