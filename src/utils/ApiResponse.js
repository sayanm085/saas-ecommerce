function ApiResponse(statusCode, data, message = "Success") {
    return {
        statusCode: statusCode,
        data: data,
        message: message,
        success: statusCode < 400
    };
}

export { ApiResponse }