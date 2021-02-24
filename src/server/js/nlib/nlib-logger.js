const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize, prettyPrint } = format;
const colorizer = winston.format.colorize();
const DailyRotateFile = require('winston-daily-rotate-file');
