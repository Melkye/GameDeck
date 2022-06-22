const { format, createLogger, transports } = require("winston");

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.errors({stack: true})
    ),
    transports: [
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log", level: "info" }),
    ],
});

const consoleFormat = format.printf(
    ({ level, message, timestamp, stack }) =>
        `${timestamp} ${level}: ${stack || message}`,
);

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            level: "info",
            format: consoleFormat,
        }),
    );
}
module.exports = logger;
