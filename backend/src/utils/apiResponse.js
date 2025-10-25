class ApiResponse {
    constructor(message = "success", data , statusCode) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode > 400;
    }
}