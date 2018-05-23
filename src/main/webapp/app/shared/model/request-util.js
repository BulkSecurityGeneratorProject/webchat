"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("@angular/common/http");
exports.createRequestOption = function (req) {
    var options = new http_1.HttpParams();
    if (req) {
        Object.keys(req).forEach(function (key) {
            if (key !== 'sort') {
                options = options.set(key, req[key]);
            }
        });
        if (req.sort) {
            req.sort.forEach(function (val) {
                options = options.append('sort', val);
            });
        }
    }
    return options;
};
