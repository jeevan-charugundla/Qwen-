var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import { generateCampaignImage } from './imageGenerationService';
import { createMiroSyncPayload, MIRO_BOARD_URL } from './miroSync';
var app = express();
var port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8787);
var campaignStore = new Map();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/generated-assets', express.static('generated-assets'));
var requestSchema = z.object({
    brand: z.object({
        company: z.string().min(1),
        industry: z.string().min(1),
        description: z.string().min(1),
        audience: z.string().min(1),
        personality: z.string().min(1),
        cta: z.string().min(1),
        primaryColor: z.string(),
    }),
    campaign: z.object({
        name: z.string().min(1),
        objective: z.string().min(1),
        duration: z.number(),
        platforms: z.array(z.string()).min(1),
        tone: z.string().min(1),
    }),
});
function demoCampaign(input) {
    var brand = input.brand, campaign = input.campaign;
    var topics = [
        ['The signal your audience is waiting for', 'Reel', 'A sharp, human introduction to the problem your brand solves.'],
        ['Three things your audience should know', 'Carousel', 'Turn expertise into a saveable, easy-to-scan checklist.'],
        ['A point of view worth sharing', 'LinkedIn post', 'Lead with a clear opinion and invite a thoughtful response.'],
        ['Behind the scenes of the promise', 'Story', 'Show the people and process behind the product.'],
        ['The customer question we hear most', 'Carousel', 'Answer one objection with proof and practical guidance.'],
        ['A small win worth celebrating', 'Static post', 'Build momentum by making progress visible and relatable.'],
        ['Your next step', 'Reel', 'Close the week with a simple, specific invitation to act.'],
    ];
    return {
        campaignId: crypto.randomUUID(),
        campaignName: campaign.name,
        campaignTheme: 'Make the next move feel obvious',
        campaignObjective: campaign.objective,
        campaignSummary: "".concat(brand.company, " earns attention by translating ").concat(brand.industry.toLowerCase(), " expertise into useful, human moments for ").concat(brand.audience.toLowerCase(), "."),
        targetAudience: brand.audience,
        contentPillars: [
            { name: 'Clarity', purpose: 'Make the problem and the next step easy to understand.' },
            { name: 'Proof', purpose: 'Build trust with practical, grounded insight.' },
            { name: 'Momentum', purpose: 'Turn interest into a confident action.' },
        ],
        brand: brand.company,
        duration: campaign.duration,
        miroSyncStatus: 'Not Synced',
        calendar: topics.map(function (_a, index) {
            var topic = _a[0], format = _a[1], brief = _a[2];
            return ({
                contentId: "".concat(campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), "-").concat(index + 1),
                day: index + 1,
                platform: campaign.platforms[index % campaign.platforms.length],
                format: format,
                topic: topic,
                hook: "".concat(topic, " \u2014 a practical perspective from ").concat(brand.company, "."),
                caption: "".concat(topic, ". Here is what matters: ").concat(brief, " ").concat(brand.cta, "."),
                cta: brand.cta,
                creativeBrief: brief,
                creativeConcept: "".concat(brand.company, " turns ").concat(topic.toLowerCase(), " into a clear next step."),
                creativePrompt: "".concat(brand.company, ", ").concat(campaign.objective, ", for ").concat(brand.audience, ": ").concat(topic, ". ").concat(brief, " Premium editorial social media creative, minimal text, ").concat(campaign.platforms[index % campaign.platforms.length], " format."),
                visualStyle: 'Premium editorial photography',
                composition: 'Subject positioned to leave negative space for copy',
                subject: topic,
                lighting: 'Soft natural studio lighting',
                colorDirection: "Clean neutral tones with ".concat(brand.primaryColor, " accent"),
                aspectRatio: '1:1',
                status: 'Draft',
            });
        }),
    };
}
app.post('/api/campaign/generate', function (req, res) {
    var parsed = requestSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Please complete the brand and campaign fields.' });
    var campaign = demoCampaign(parsed.data);
    campaignStore.set(campaign.campaignId, campaign);
    return res.json({ mode: 'demo', campaign: campaign });
});
app.post('/api/content/generate', function (req, res) { return res.json({ mode: 'demo', message: 'Content regenerated in demo mode.' }); });
app.post('/api/creative/generate', function (req, res) { return res.json({ mode: 'demo', message: 'Creative generated in demo mode.' }); });
var imageRequestSchema = z.object({
    campaignId: z.string().min(1),
    contentId: z.string().min(1),
    prompt: z.string().min(10).max(4000),
    aspectRatio: z.enum(['1:1', '4:5', '16:9']).default('1:1'),
});
app.post('/api/images/generate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, dimensions, campaign, image_1, calendar, error_1, message;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                parsed = imageRequestSchema.safeParse(req.body);
                if (!parsed.success)
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'campaignId, contentId, aspectRatio, and a descriptive prompt are required.' })];
                dimensions = parsed.data.aspectRatio === '4:5'
                    ? { width: 1024, height: 1280 }
                    : parsed.data.aspectRatio === '16:9'
                        ? { width: 1344, height: 768 }
                        : { width: 1024, height: 1024 };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                campaign = campaignStore.get(parsed.data.campaignId);
                if (!campaign)
                    return [2 /*return*/, res.status(404).json({ success: false, error: 'Campaign not found.' })];
                if (!campaign.calendar.some(function (item) { return item.contentId === parsed.data.contentId; })) {
                    return [2 /*return*/, res.status(404).json({ success: false, error: 'Content item not found in campaign.' })];
                }
                return [4 /*yield*/, generateCampaignImage(parsed.data.prompt, dimensions)];
            case 2:
                image_1 = _b.sent();
                calendar = campaign.calendar.map(function (item) { return item.contentId === parsed.data.contentId
                    ? __assign(__assign({}, item), { generatedImage: { id: image_1.imageId, url: image_1.imageUrl, prompt: image_1.prompt } }) : item; });
                campaignStore.set(parsed.data.campaignId, __assign(__assign({}, campaign), { calendar: calendar, generatedImages: __spreadArray(__spreadArray([], ((_a = campaign.generatedImages) !== null && _a !== void 0 ? _a : []).filter(function (item) { return item.id !== image_1.imageId; }), true), [{ id: image_1.imageId, url: image_1.imageUrl, prompt: image_1.prompt }], false) }));
                return [2 /*return*/, res.json({
                        success: true,
                        image: { id: image_1.imageId, url: image_1.imageUrl, prompt: image_1.prompt },
                    })];
            case 3:
                error_1 = _b.sent();
                message = error_1 instanceof Error ? error_1.message : 'Image generation failed.';
                console.error("Image generation failed for campaign ".concat(parsed.data.campaignId, ", content ").concat(parsed.data.contentId, ": ").concat(message));
                return [2 /*return*/, res.status(502).json({ success: false, error: message })];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/miro/test', function (_req, res) {
    return res.json({ connected: true, mode: 'mcp', boardUrl: MIRO_BOARD_URL, message: 'Miro MCP board is linked.' });
});
app.get('/api/campaigns/:campaignId/miro-payload', function (req, res) {
    var campaign = campaignStore.get(req.params.campaignId);
    if (!campaign)
        return res.status(404).json({ error: 'Campaign not found.' });
    return res.json(createMiroSyncPayload(campaign));
});
app.post('/api/miro/sync', function (req, res) {
    if (!req.body)
        return res.status(400).json({ synced: false, error: 'Campaign data is required.' });
    var payload = createMiroSyncPayload(req.body);
    var stored = campaignStore.get(payload.campaignId);
    if (stored)
        campaignStore.set(payload.campaignId, __assign(__assign({}, stored), { miroSyncStatus: 'Syncing' }));
    return res.json({ synced: false, status: 'Syncing', mode: 'mcp', payload: payload, message: 'Payload prepared for the connected Miro MCP workflow.' });
});
app.listen(port, function () { return console.log("SOCIAL OS API running on http://localhost:".concat(port)); });
