if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require("express");
const path = require('path');
const { mongoose } = require("mongoose");
const methodoverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressError = require("./utils/ExpressError"); 
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user'); 
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const dbURL = process.env.Db_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews");
const { date } = require("joi");

const MongoDBStore = require("connect-mongo");

mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
});

const app = express();
const secret1 = process.env.SECRET || "thisismysecret";

const store = MongoDBStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret1
    }
});

app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))


app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());


const sessionparam = {
    store,
    name: 'session',
    secret: secret1,
    resave: false,
    saveUninitialized: true,
    // secure: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7, 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionparam));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

app.use('/', userRoutes);
app.use('/campground', campgroundRoutes)
app.use('/campground/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('./campground/home')
})


app.all("*", (req, res, next) => {
    next(new expressError('page not found', 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Something went wrong"
    res.status(statusCode).render('./campground/error',{err});
})

const port = process.env.PORT || 3000;
app.listen(3000, () => {
    console.log(`Yelcmap starting ${port}`)
})

