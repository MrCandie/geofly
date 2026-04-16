"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendErrDev = (err, res) => {
    console.log(err);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.statusCode.toString().toLowerCase().startsWith("4")
            ? err.message
            : "Unable to complete your request at this time",
    });
};
exports.default = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    sendErrDev(err, res);
};
