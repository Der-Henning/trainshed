"use strict";

const _ = require("lodash");
const config = require("./config.json");
const defaultConfig = config.default;
const environment = process.env.NODE_ENV || "development";
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

console.log("Loaded config:");
console.log(finalConfig);

module.exports = finalConfig;
