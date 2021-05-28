const express = require('express');
const artistRouter = express.Router();
const sqlite = require('sqlite3')
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite')


artistRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({artists: artists})
        }
    });
});

artistRouter.param('artistId', (req, res, next, artistId) => {

});

module.exports = artistRouter;