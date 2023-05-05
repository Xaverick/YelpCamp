const express = require("express");
const { default: mongoose } = require("mongoose");
const campground = require("../models/campground");
const Campground = require("../models/campground");
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
});


const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany();
    const price = Math.floor(Math.random() * 20) + 10;
    for (let i = 0; i < 200; i++){
        const rand1000 = Math.floor(Math.random() * 1000);
        const camp = new campground({
            author: "6419d7d6adf0685f2b9873f3",
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusantium voluptatum tempore repudiandae est ipsum, corrupti recusandae ratione dolorem quidem adipisci nam nemo! Quos ratione repellendus nam quae deleniti, quo pariatur!",
            price,
            
            geometry: {
                type: "Point",
                coordinates:[
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },

            images:[
                {
                    url: 'https://res.cloudinary.com/dkbsrsblc/image/upload/v1682528161/YelpCamp/olr28ka4qxwqhq0l4rkv.jpg',
                    filename: 'YelpCamp/olr28ka4qxwqhq0l4rkv',
                    
                },
                {
                    url: 'https://res.cloudinary.com/dkbsrsblc/image/upload/v1682528162/YelpCamp/jfrgfvwibojhm4nj14q1.jpg',
                    filename: 'YelpCamp/jfrgfvwibojhm4nj14q1',
                
                }
            ],

        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
})

