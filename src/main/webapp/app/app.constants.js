"use strict";
// These constants are injected via webpack environment variables.
// You can add more variables in webpack.common.js or in profile specific webpack.<dev|prod>.js files.
// If you change the values in the webpack config files, you need to re run webpack to update the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = process.env.VERSION;
exports.DEBUG_INFO_ENABLED = !!process.env.DEBUG_INFO_ENABLED;
exports.SERVER_API_URL = process.env.SERVER_API_URL;
exports.BUILD_TIMESTAMP = process.env.BUILD_TIMESTAMP;
