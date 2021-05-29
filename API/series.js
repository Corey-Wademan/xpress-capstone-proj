const express = require('express');
const seriesRouter = express.Router();
const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = require('./issues');

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE Series.id = $seriesId`, {$seriesId: seriesId }, (err, series) => {
        if (err) {
            next(err)
        } else if (series) {
            req.series = series;
            next();
        } else { res.sendStatus(404) }
    });
});

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, series) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({series:series})
        }
    })
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({ series: req.series })
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if (!name || !description) {
        return res.sendStatus(400);
    } 

    const query = `INSERT INTO Series (name, description) VALUES ($name, $description)`;
    const values = {
        $name: name,
        $description: description
    };
    db.run(query, values, function(err) {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`, (err, series) => {
            res.status(201).json({series:series})
        })
        }
    })
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if (!name || !description) {
        return res.sendStatus(400);
    }

    const query = `UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId`;
    const values = {
        $name: name,
        $description: description,
        $seriesId: req.params.seriesId
    };
    db.run(query, values, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`, (err, series) => {
                res.status(200).json({ series: series })
            });
        };
    });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get(`SELECT FROM Issue WHERE Issue.series_id = ${req.params.seriesId}`, (error, issue) => {
        if (error) {
            next(error)
        } else if (issue) {
            res.sendStatus(400)
        } else {
            db.run(`DELETE FROM Series WHERE Issue.series_id = ${req.params.seriesId}`, (error) => {
                if (error) {
                    next(error)
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = seriesRouter;