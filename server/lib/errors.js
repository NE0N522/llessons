class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function assert(condition, status, message) {
  if (!condition) throw new HttpError(status, message);
}

function asId(value) {
  const id = Number(value);
  assert(Number.isSafeInteger(id) && id > 0, 400, 'Неверный идентификатор.');
  return id;
}

module.exports = { HttpError, assert, asId };
