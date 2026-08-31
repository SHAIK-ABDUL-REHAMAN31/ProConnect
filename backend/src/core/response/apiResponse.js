export class ApiResponse {
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data = null, message = "Resource created successfully") {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = "Internal Server Error", statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

export default ApiResponse;
