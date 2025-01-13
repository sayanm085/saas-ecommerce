//  * Creates an API error object.
//  * @param {number} statusCode - The HTTP status code.
//  * @param {string} [message="Something went wrong"] - The error message.
//  * @param {Array} [errors=[]] - Additional error details.
//  * @param {string} [stack=""] - The stack trace.
//  * @returns {Error} The created error object.

function createApiError(statusCode, message = "Something went wrong", errors = [], stack = "") {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = null;
    error.message = message;
    error.success = false;
    error.errors = errors;

    if (stack) {
        error.stack = stack;
    } else {
        Error.captureStackTrace(error, createApiError);
    }

    return error;
}

export { createApiError };
