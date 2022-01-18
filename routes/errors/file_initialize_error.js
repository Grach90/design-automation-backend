module.exports = class FileInitializeError extends Error {
  constructor(status, type, message) {
    super(message);
    this.status = status;
    this.type = type;
  }

  static ObjectNotFound() {
    return new FileInitializeError(
      404,
      "OBJECT_NOT_FOUND",
      "Object with passed name not found"
    );
  }

  static CannotCreateBucket() {
    return new FileInitializeError(
      400,
      "CANNOT_CREATE_BUCKET",
      "Something went wrong when trying to create a bucket"
    );
  }

  static TimeOut() {
    return new FileInitializeError(408, "TIMEOUT", "Request Timeout");
  }

  static BadRequest() {
    return new FileInitializeError(400, "BAD_REQUEST", "Bad Request");
  }

  static TranslationError() {
    return new FileInitializeError(
      400,
      "TRANSLATION_ERROR",
      "Something went wrong when trying to translite the object"
    );
  }
};
