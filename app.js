const express = require('express');

const router = require('./routes/index');

const app = express();
const port = 3000;

app.use(router);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('started!');
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
