const { ApiError } = require("./apiError");

const asyncHandler =  fn => async (req,res,next) => {
        try {
            await fn(req, res , next)
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(error.http_code || 500).json(new ApiError(500, error.message || "Internal Server Error"));
        }
    }
module.exports = {asyncHandler};