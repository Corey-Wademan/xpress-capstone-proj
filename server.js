const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = requrie('cors');



app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());