const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = requrie('cors');
const apiRouter = require('./API/api')

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use('/api', apiRouter)





app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT} `);
});
module.exports = app;