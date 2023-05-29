const chalk = require('chalk');
const log = require('loglevel');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const dayjs = require('dayjs');
const prefix = require('loglevel-plugin-prefix');

const config = require('./config.json');

const level = process.env.LOG_LEVEL || config.LOG_LEVEL;

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'America/Chicago';

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

prefix.reg(log);

log.setLevel(level);

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${dayjs(new Date().toISOString()).tz(tz)}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(`${name}:`)}`;
  },
});

const getFunctionPrefix = (functionName) => {
  let result = '';
  if (functionName) {
    result = `[FUNCTION: ${functionName}] `;
  }
  return result;
};

const getFilePrefix = (fileName) => {
  let result = '';
  if (fileName) {
    result = `[FILE: ${fileName}]: `;
  }
  return result;
};

function info(message, fileName, functionName = info.caller.name) {
  const functionPrefix = getFunctionPrefix(functionName);
  const filePrefix = getFilePrefix(fileName);
  const finalMessage = `${functionPrefix}${filePrefix}${message}`;
  log.info(finalMessage);
}

function trace(message, fileName, functionName = trace.caller.name) {
  const functionPrefix = getFunctionPrefix(functionName);
  const filePrefix = getFilePrefix(fileName);
  const finalMessage = `${functionPrefix}${filePrefix}${message}`;
  log.trace(finalMessage);
}

function debug(message, fileName, functionName = debug.caller.name) {
  const functionPrefix = getFunctionPrefix(functionName);
  const filePrefix = getFilePrefix(fileName);
  const finalMessage = `${functionPrefix}${filePrefix}${message}`;
  log.debug(finalMessage);
}

function warn(message, fileName, functionName = warn.caller.name) {
  const functionPrefix = getFunctionPrefix(functionName);
  const filePrefix = getFilePrefix(fileName);
  const finalMessage = `${functionPrefix}${filePrefix}${message}`;
  log.warn(finalMessage);
}

function error(message, fileName, functionName = error.caller.name) {
  const functionPrefix = getFunctionPrefix(functionName);
  const filePrefix = getFilePrefix(fileName);
  const finalMessage = `${functionPrefix}${filePrefix}${message}`;
  log.error(finalMessage);
}

module.exports = {
  trace,
  debug,
  info,
  warn,
  error,
};
