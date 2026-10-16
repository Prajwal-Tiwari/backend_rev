import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { APIerror } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";

//function to generate Access and Refresh Tokens
const generateTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        console.log("access token: ", accessToken);
        console.log("refresh token: ", refreshToken);

        user.refreshToken = refreshToken;
        console.log(user);
    
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};

    } catch(error){
        throw new APIerror(500, "Something went wrong while generating tokens")
    }
}

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

const loginUser = asyncHandler(async(req, res) => {
    //Get data from frontend via request (req body -> data)
    //Validate it (usernamme or email and password is required)
    //Find the user
    //Check password (Authentication)
    //Generate Access token and refresh token
    //Send cookie and response
    //then logged in

    const {email, username, password} = req.body;

    if(!username && !email){
        throw new APIerror(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new APIerror(400, "User is not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new APIerror(401, "Invalid Credential")
    }

    const {accessToken, refreshToken} = await generateTokens(user._id);

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true
    } //can't modify it by frontend

    console.log(user);

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new APIresponse(
                    200,
                    {
                        user: loggedinUser, accessToken, refreshToken
                    },
                    "User logged in successfully"
                )
            )


})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new APIresponse(200, {}, "User Logged Out"))
})

const tokenHandler = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new APIerror(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if(!user){
        throw new APIerror(401, "Invalid Refresh Token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new APIerror(401, "Refresh Token is expired or used")
    }

    const {accessToken, newRefreshToken} = await generateTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIresponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access Token refreshed"
                )
            );
    } catch(error){
        throw new APIerror(401, error?.message || "Invalid Refresh token");
    }
    
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    tokenHandler
 }