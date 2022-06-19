"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
var bcrypt_1 = require("bcrypt");
var mongoose_1 = require("mongoose");
var supertest_1 = require("supertest");
var app_1 = require("@/app");
var users_route_1 = require("@routes/users.route");
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 500); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
describe('Testing Users', function () {
    describe('[GET] /users', function () {
        it('response fineAll Users', function () { return __awaiter(void 0, void 0, void 0, function () {
            var usersRoute, users, _a, _b, _c, _d, app;
            var _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        usersRoute = new users_route_1.default();
                        users = usersRoute.usersController.userService.users;
                        _a = users;
                        _c = (_b = jest.fn()).mockReturnValue;
                        _e = {
                            _id: 'qpwoeiruty',
                            email: 'a@email.com'
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash('q1w2e3r4!', 10)];
                    case 1:
                        _d = [
                            (_e.password = _h.sent(),
                                _e)
                        ];
                        _f = {
                            _id: 'alskdjfhg',
                            email: 'b@email.com'
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash('a1s2d3f4!', 10)];
                    case 2:
                        _d = _d.concat([
                            (_f.password = _h.sent(),
                                _f)
                        ]);
                        _g = {
                            _id: 'zmxncbv',
                            email: 'c@email.com'
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash('z1x2c3v4!', 10)];
                    case 3:
                        _a.find = _c.apply(_b, [_d.concat([
                                (_g.password = _h.sent(),
                                    _g)
                            ])]);
                        mongoose_1.default.connect = jest.fn();
                        app = new app_1.default([usersRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer()).get("".concat(usersRoute.path)).expect(200)];
                }
            });
        }); });
    });
    describe('[GET] /users/:id', function () {
        it('response findOne User', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userId, usersRoute, users, _a, _b, _c, app;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        userId = 'qpwoeiruty';
                        usersRoute = new users_route_1.default();
                        users = usersRoute.usersController.userService.users;
                        _a = users;
                        _c = (_b = jest.fn()).mockReturnValue;
                        _d = {
                            _id: 'qpwoeiruty',
                            email: 'a@email.com'
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash('q1w2e3r4!', 10)];
                    case 1:
                        _a.findOne = _c.apply(_b, [(_d.password = _e.sent(),
                                _d)]);
                        mongoose_1.default.connect = jest.fn();
                        app = new app_1.default([usersRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer()).get("".concat(usersRoute.path, "/").concat(userId)).expect(200)];
                }
            });
        }); });
    });
    describe('[POST] /users', function () {
        it('response Create User', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userData, usersRoute, users, _a, _b, _c, app;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        userData = {
                            email: 'test@email.com',
                            password: 'q1w2e3r4',
                        };
                        usersRoute = new users_route_1.default();
                        users = usersRoute.usersController.userService.users;
                        users.findOne = jest.fn().mockReturnValue(null);
                        _a = users;
                        _c = (_b = jest.fn()).mockReturnValue;
                        _d = {
                            _id: '60706478aad6c9ad19a31c84',
                            email: userData.email
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash(userData.password, 10)];
                    case 1:
                        _a.create = _c.apply(_b, [(_d.password = _e.sent(),
                                _d)]);
                        mongoose_1.default.connect = jest.fn();
                        app = new app_1.default([usersRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer()).post("".concat(usersRoute.path)).send(userData).expect(201)];
                }
            });
        }); });
    });
    describe('[PUT] /users/:id', function () {
        it('response Update User', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userId, userData, usersRoute, users, _a, _b, _c, _d, _e, _f, app;
            var _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        userId = '60706478aad6c9ad19a31c84';
                        userData = {
                            email: 'test@email.com',
                            password: 'q1w2e3r4',
                        };
                        usersRoute = new users_route_1.default();
                        users = usersRoute.usersController.userService.users;
                        if (!userData.email) return [3 /*break*/, 2];
                        _a = users;
                        _c = (_b = jest.fn()).mockReturnValue;
                        _g = {
                            _id: userId,
                            email: userData.email
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash(userData.password, 10)];
                    case 1:
                        _a.findOne = _c.apply(_b, [(_g.password = _j.sent(),
                                _g)]);
                        _j.label = 2;
                    case 2:
                        _d = users;
                        _f = (_e = jest.fn()).mockReturnValue;
                        _h = {
                            _id: userId,
                            email: userData.email
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash(userData.password, 10)];
                    case 3:
                        _d.findByIdAndUpdate = _f.apply(_e, [(_h.password = _j.sent(),
                                _h)]);
                        mongoose_1.default.connect = jest.fn();
                        app = new app_1.default([usersRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer()).put("".concat(usersRoute.path, "/").concat(userId)).send(userData)];
                }
            });
        }); });
    });
    describe('[DELETE] /users/:id', function () {
        it('response Delete User', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userId, usersRoute, users, _a, _b, _c, app;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        userId = '60706478aad6c9ad19a31c84';
                        usersRoute = new users_route_1.default();
                        users = usersRoute.usersController.userService.users;
                        _a = users;
                        _c = (_b = jest.fn()).mockReturnValue;
                        _d = {
                            _id: '60706478aad6c9ad19a31c84',
                            email: 'test@email.com'
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash('q1w2e3r4!', 10)];
                    case 1:
                        _a.findByIdAndDelete = _c.apply(_b, [(_d.password = _e.sent(),
                                _d)]);
                        mongoose_1.default.connect = jest.fn();
                        app = new app_1.default([usersRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer()).delete("".concat(usersRoute.path, "/").concat(userId)).expect(200)];
                }
            });
        }); });
    });
});
