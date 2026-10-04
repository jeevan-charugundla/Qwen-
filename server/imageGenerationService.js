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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
import { InferenceClient } from '@huggingface/inference';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
var model = 'black-forest-labs/FLUX.1-schnell';
var assetsDirectory = path.resolve(process.cwd(), 'generated-assets');
export function generateCampaignImage(prompt, options) {
    return __awaiter(this, void 0, void 0, function () {
        var token, client, image, imageId, fileName, filePath, _a, _b, _c, _d;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    token = process.env.HF_TOKEN;
                    if (!token)
                        throw new Error('Hugging Face is not configured. Add HF_TOKEN to the server environment.');
                    client = new InferenceClient(token);
                    return [4 /*yield*/, client.textToImage({
                            model: model,
                            inputs: prompt,
                            parameters: {
                                width: (_e = options === null || options === void 0 ? void 0 : options.width) !== null && _e !== void 0 ? _e : 1024,
                                height: (_f = options === null || options === void 0 ? void 0 : options.height) !== null && _f !== void 0 ? _f : 1024,
                            },
                        }, { outputType: 'blob' })];
                case 1:
                    image = _g.sent();
                    imageId = randomUUID();
                    fileName = "".concat(imageId, ".png");
                    return [4 /*yield*/, mkdir(assetsDirectory, { recursive: true })];
                case 2:
                    _g.sent();
                    filePath = path.join(assetsDirectory, fileName);
                    _a = writeFile;
                    _b = [filePath];
                    _d = (_c = Buffer).from;
                    return [4 /*yield*/, image.arrayBuffer()];
                case 3: return [4 /*yield*/, _a.apply(void 0, _b.concat([_d.apply(_c, [_g.sent()])]))];
                case 4:
                    _g.sent();
                    return [2 /*return*/, {
                            imageId: imageId,
                            imageUrl: "/generated-assets/".concat(fileName),
                            localPath: filePath,
                            prompt: prompt,
                        }];
            }
        });
    });
}
