const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize, prettyPrint } = format;
//const colorizer = winston.format.colorize();
const DailyRotateFile = require('winston-daily-rotate-file');

// The default log file options.
const DEFAULT_LOG_FILE_OPTIONS = {
    auditFile: 'logger-audit.json',
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    //datePattern: 'YYYY-MM-DD-HH-mm',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d'
}

const logFormat = printf((info, opts) => {
    //return colorizer.colorize(level, `${timestamp} ${level}: ${message}`);
    //return `${timestamp} ${level}: ${message}`;
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

/*
const log_file_opts =  {
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
}

const logger = createLogger({
    // general format.
    format: combine(
        timestamp(),
        logFormat),
    transports: [
        new transports.Console({
            // custom format for console.
            format: combine(
                colorize({all: true}),
                timestamp(),
                prettyPrint(),
                logFormat)
        }),
        //new transports.File({ filename: 'combined.log' }),
        new DailyRotateFile(log_file_opts)
    ]        
})

*/