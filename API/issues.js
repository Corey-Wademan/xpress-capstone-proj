const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE Issue.id = $issueId`, { $issueId: issueId }, (err, issue) => {
        if (err) {
            next(err)
        } else if (issue) {
            req.issue = issue;
            next();
        } else { res.sendStatus(404) };
    });
});


issuesRouter.get('/', (req, res, next) => {
    const query = `SELECT * FROM Issue WHERE Issue.series_id = $seriesId` 
    const values = {$seriesId: req.params.seriesId} 
    db.all(query, values, (error, issues) => {
        if (error) {
            next(error)
        } else {
            res.status(200).json({issues:issues})
        }
    });   
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        artistId = req.body.issue.artistId;
    const artistQuery = `SELECT * FROM Artist WHERE Artist.id = $artistId`;
    const artistValues = { $artistId: artistId };

    db.get(artistQuery, artistValues, (error, artist) => {
        if (error) {
            next(error)
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400)
            }
        }
    });

    const query = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesID)`;
    const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.params.seriesId
    };
    db.run(query, values, function (error) {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (err, issue) => {
                res.status(201).json({ issue: issue })
            })
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        artistId = req.body.issue.artistId;
    const artistQuery = `SELECT * FROM Issue WHERE Artist.id = $artistId`;
    const artistValues = { $artistId: artistId };

    db.get(artistQuery, artistValues, (error, artist) => {
        if (error) {
            next(error)
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400);
            }
        }
    });

    const query = `UPDATE ISSUE SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $issueId `;
    const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $issueId: req.params.issueId
    };

    db.run(query, values, function (error) {
        if (error) {
            next(error)
        } else {
            db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err, issue) => {
                res.status(200).json({ issue: issue })
            });
        }
    });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE Issue.id = ${req.params.issueId}`, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = issuesRouter;