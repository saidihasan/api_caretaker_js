require("dotenv/config")
const express = require('express'),
    bodyParser = require('body-parser');
var cors = require('cors');
const logger = require('morgan')
const createError = require('http-errors')
const path = require('path')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const { GridFsStorage } = require('multer-gridfs-storage')
const multer = require('multer')
const crypto = require('crypto')
const app = express();
const port = process.env.PORT || 4000;
const MongoDbConnector = require('./mongoDbConnector')
const mongoDbConnector = new MongoDbConnector({
    name: 'caretaker-rest-api',
    host: 'mongodb://localhost:27017'
})
const collection = "perawat"

mongoDbConnector.connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
    origin: '*',
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const imageRouter = require('./routes/image');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url = process.env.DB;
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

// connect to the database
connect.then(() => {
    console.log('Connected to database: caretaker-photos');
}, (err) => console.log(err));

/* 
    GridFs Configuration
*/

// create storage engine
const storage = new GridFsStorage({
    url: process.env.DB,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

app.use('/', imageRouter(upload));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

app.listen(port, () => {
    console.log(`cli-nodejs-api listening at http://localhost:${port}`)
});

app.delete('/user/:id', async(req, res) => {
    const result = await mongoDbConnector.deleteOne(
        collection, { _id: req.params.id },
    )
    result.send()
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async() => {
        console.log("Stop signal received")
        mongoDbConnector.disconnect();
        console.log("Goodbye!")
        process.exit(0)
    });
});

module.exports = app;