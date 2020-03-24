"use strict";

const config = require("./config.json") || null;
var finalConfig = {};
if (config) {
  const _ = require("lodash");
  const defaultConfig = config.default;
  const environment = process.env.NODE_ENV || "development";
  const environmentConfig = config[environment];
  finalConfig = _.merge(defaultConfig, environmentConfig);
} else {
  finalConfig = {
    port: process.env.PORT || 4000,
    json_indentation: process.env.JSON_IDENTATION || 4,
    database: process.env.DATABASE_URL,
    username: process.env.DATABASE_USERNAME || "",
    password: process.env.DATABASE_PASSWORD || "",
    myprivatekey: process.env.PRIVATE_KEY || "myprivatekey",
    salt_rounds: process.env.SALT_ROUNDS || 10
  };
}

console.log("Loaded config:");
console.log(finalConfig);

module.exports = finalConfig;
