/* eslint-env node */
/* eslint no-console: ["off"] */
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static(path.join('dist')));

app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`);
});
