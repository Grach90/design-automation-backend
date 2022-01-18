module.exports = class SendlerError extends Error {
  constructor(status, type, message) {
    super(message);
    this.status = status;
    this.type = type;
  }

  static NotFoundError() {
    return new SendlerError(
      404,
      "CONTENT_NOT_FOUND",
      "Information file is not found"
    );
  }
  static InternalError() {
    return new SendlerError(
      500,
      "SOMETHING_WENT_WRONG",
      "Something went wrong please try later"
    );
  }
};
