// linked with tokens.py

const express = require("express");
const mongoose = require("mongoose")
const bodyparser = require('body-parser');
const crypto = require("crypto");
require("dotenv").config()
const User = require('./users.js')
const jwt = require('jsonwebtoken');
const fs = require('fs');
// const expressJwt = require('express-jwt');

//app
const app = express();

// db
mongoose.connect(process.env.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => { console.log("connected to database") }).catch((err) => { console.log("error=", err) });

// middleware
app.use(bodyparser.json())


app.get("/", (req, res) => {
    res.send("hello from node");
});



app.post("/register", (req, res) => {
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                error: "enter valid email and password"
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    })
});


app.post("/login", (req, res) => {
    console.log("signing in!!");
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
        if (err || !user) {
            return res.status(400).json("enter valid username and password!");
        }

        if (!password) {
            return res.status(401).json("Enter password!");
        }
        try {
            if (user.hashed_password === crypto.createHmac('sha1', user.salt)
                .update(password)
                .digest("hex")) {

                const token = jwt.sign({
                    _id: user._id
                }, process.env.JWT_SECRET);

                return res.json({ token, username });
            }
        }
        catch (err) {
            return res.status(400).json("error occured!");
        }

    });
});


app.post("/upload", (req, res) => {
    res.setHeader('Transfer-Encoding',"chunked");
    console.log("inside upload");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`the site is on port: ${port}`)
});