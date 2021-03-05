const path = require('path')
const fs = require('fs')

// setup root path. only call once when module load (require).
process.env['ROOT_PATHS'] = path.dirname(require.main.filename)
const rootPath = process.env['ROOT_PATHS']

const winston = require('winston')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf, colorize, prettyPrint } = format
//const colorizer = winston.format.colorize()
const DailyRotateFile = require('winston-daily-rotate-file')

// The default log file options.
const DEFAULT_LOG_FILE_OPTIONS = {
    auditFile: 'logger-audit.json',
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    //datePattern: 'YYYY-MM-DD-HH-mm',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d'
}

const logFormat = printf((info, opts) => {
    //return colorizer.colorize(level, `${timestamp} ${level}: ${message}`);
    //return `${timestamp} ${level}: ${message}`;
    return `${info.timestamp} ${info.level}: ${info.message}`
});

// default config file name.
let cfgFile = path.join(rootPath, 'logger.config.json')
let logOptions = null;
let logger = null

const exist = () => { return fs.existsSync(cfgFile) }
const save = () => {  
    if (!logOptions) logOptions = DEFAULT_LOG_FILE_OPTIONS
    return fs.writeFileSync(cfgFile, JSON.stringify(logOptions, null, 4), 'utf8');
}
const load = () => {
    let sJson = fs.readFileSync(cfgFile, 'utf8');
    try { logOptions = JSON.parse(sJson) }
    catch { logOptions = DEFAULT_LOG_FILE_OPTIONS }
}

const InitLogger = () => {
    if (null != logger) return // already create.

    if (!exist()) {
        // set default
        logOptions = DEFAULT_LOG_FILE_OPTIONS;
        save() // save log config
    }
    load() // load log config.

    logger = createLogger({
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
            new DailyRotateFile(logOptions)
        ]        
    })

    logger.stream = {
        write: function(message, encoding) {
            // morgan always has newline so remove it before send to log.
            logger.info(message.substring(0,message.lastIndexOf('\n')));
        }
    }    
}

InitLogger();

module.exports.logger = exports.logger = logger;