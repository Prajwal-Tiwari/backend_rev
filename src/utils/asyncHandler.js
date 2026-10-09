// const asyncHandler = (functionHandler)=> async (req,res,next)=>{
//     try{
//         await functionHandler(req,res,next)
//     } catch(error){
//         console.log("Error handling this request: ", error);
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// } <- try-catch method

const asyncHandler = (reqHandler)=> async (req, res, next)=> {
    Promise.resolve(reqHandler(req,res,next)).catch((err)=>next(err))
}

export {asyncHandler}