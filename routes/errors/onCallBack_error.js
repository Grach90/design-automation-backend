module.exports = class OnCallBackError extends Error {
  constructor(status, type, message) {
    super(message);
    this.status = status;
    this.type = type;
  }

  static PermissonError() {
    return new OnCallBackError(
      403,
      "FORDBIDDEN",
      "You dont have permisson for that operation"
    );
  }
  static NotFound() {
    return new OnCallBackError(404, "NOT_FOUND", "Object not found");
  }
};
