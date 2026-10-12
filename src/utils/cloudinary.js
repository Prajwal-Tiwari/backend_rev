import {v2 as cdinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})
 
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        
        //uploading
        const response = await cdinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //uploaded
        console.log("Uploaded", response.url);
        return response
    } catch(error) {
        fs.unlinkSync(localFilePath) //removing the locally saved temp file as the uploaded operation get failed
        return null
    }
}

export {uploadOnCloudinary}

