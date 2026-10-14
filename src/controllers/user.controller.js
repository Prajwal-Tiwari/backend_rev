import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { APIerror } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/responseHandler.js";

const registerUser = asyncHandler(async (req, res) => {
   

    // console.log("BODY:", req.body); //*
    // console.log("FILES:", req.files);//*
    const { fullName, username, email, password } = req.body

  
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new APIerror(400, "All fields are required...")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new APIerror(409, "User already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new APIerror(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //console.log("Avatar cd result: ", avatar) //*DEBUG
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 
    //console.log("Avatar coverImage result: ", coverImage) //*DEBUG
    if(!avatar){
        throw new APIerror(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new APIerror(500, "Something went wrong...")
    }

    return res.status(201).json(
        new APIresponse(200, createdUser, "User Registered Successfully")
    )

})

export { registerUser }