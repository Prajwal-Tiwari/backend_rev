// require('dotenv').config({path: './env'});
import "dotenv/config"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connDB from "./db/db.js";

connDB();













/*
//this approach is all in one: 


import express from "express";
const app = express()

// function connectDB(){}
// connectDB();

;( async ()=>{
    try {

        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("ERROR: ", error);
            throw error;
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on ${process.env.PORT}`);
        })

    } catch(e){
        console.error("ERROR: ",e);
        throw e;
    }
})()
*/