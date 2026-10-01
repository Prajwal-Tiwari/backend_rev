import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected, DB Host: ${connectionInstance.connection.host}`);
    } catch(err){
        console.log("Mongo DB ERROR: ", err);
        process.exit(1);
    }
}

export default connDB;