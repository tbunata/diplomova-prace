import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  console.log("node env: ", process.env.NODE_ENV);
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
