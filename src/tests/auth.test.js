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
// @ts-nocheck
var bcrypt_1 = require("bcrypt");
var mongoose_1 = require("mongoose");
var supertest_1 = require("supertest");
var app_1 = require("@/app");
var auth_route_1 = require("@routes/auth.route");
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
describe('Testing Auth', function () {
    describe('[POST] /signup', function () {
        it('response should have the Create userData', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userData, authRoute, users, _a, _b, _c, app;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        userData = {
                            email: 'test@email.com',
                            password: 'q1w2e3r4!',
                        };
                        authRoute = new auth_route_1.default();
                        users = authRoute.authController.authService.users;
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
                        app = new app_1.default([authRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer()).post("".concat(authRoute.path, "signup")).send(userData)];
                }
            });
        }); });
    });
    describe('[POST] /login', function () {
        it('response should have the Set-Cookie header with the Authorization token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userData, authRoute, users, _a, _b, _c, app;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        userData = {
                            email: 'test@email.com',
                            password: 'q1w2e3r4!',
                        };
                        authRoute = new auth_route_1.default();
                        users = authRoute.authController.authService.users;
                        _a = users;
                        _c = (_b = jest.fn()).mockReturnValue;
                        _d = {
                            _id: '60706478aad6c9ad19a31c84',
                            email: userData.email
                        };
                        return [4 /*yield*/, bcrypt_1.default.hash(userData.password, 10)];
                    case 1:
                        _a.findOne = _c.apply(_b, [(_d.password = _e.sent(),
                                _d)]);
                        mongoose_1.default.connect = jest.fn();
                        app = new app_1.default([authRoute]);
                        return [2 /*return*/, (0, supertest_1.default)(app.getServer())
                                .post("".concat(authRoute.path, "login"))
                                .send(userData)
                                .expect('Set-Cookie', /^Authorization=.+/)];
                }
            });
        }); });
    });
    // describe('[POST] /logout', () => {
    //   it('logout Set-Cookie Authorization=; Max-age=0', async () => {
    //     const userData: User = {
    //       _id: '60706478aad6c9ad19a31c84',
    //       email: 'test@email.com',
    //       password: await bcrypt.hash('q1w2e3r4!', 10),
    //     };
    //     const authRoute = new AuthRoute();
    //     const users = authRoute.authController.authService.users;
    //     users.findOne = jest.fn().mockReturnValue(userData);
    //     (mongoose as any).connect = jest.fn();
    //     const app = new App([authRoute]);
    //     return request(app.getServer())
    //       .post(`${authRoute.path}logout`)
    //       .send(userData)
    //       .set('Set-Cookie', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ')
    //       .expect('Set-Cookie', /^Authorization=\; Max-age=0/);
    //   });
    // });
});
