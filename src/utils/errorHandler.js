 class APIerror extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors=[],
        statck=""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.errors = errors
        this.success = false
        this.message = message


        if(statck) {
            this.stack = stack
        } else{
            Error.captureStacktrace(this, this.constructor)
        }
    }
 }

 export {APIerror}