class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong !",
        errors = [],
        stacks = ""
    ){
        super(),
        this.statusCode = statusCode;
        this.message= message;
        this.data = null;
        this.errors = errors;
        this.success = false;

        if(stacks){
            this.stacks = stacks;
        }else{
            Error.captureStackTrace(this , this.constructor);
        }

    }

}

module.exports = {ApiError};