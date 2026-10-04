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
export var MIRO_BOARD_URL = 'https://miro.com/app/board/uXjVEervLkQ=/';
var MiroSyncService = /** @class */ (function () {
    function MiroSyncService() {
    }
    MiroSyncService.prototype.buildPayload = function (campaign) {
        return __assign(__assign({}, campaign), { boardUrl: MIRO_BOARD_URL, sectionKey: "social-os-campaign-".concat(campaign.campaignId), workspace: {
                sections: [
                    'Campaign Overview',
                    'Campaign Objective',
                    'Target Audience',
                    'Big Campaign Idea',
                    'Content Pillars',
                    'Message Map',
                    '7-Day Content Journey',
                    'Content Studio',
                    'Creative Studio',
                    'Production Pipeline',
                    'Distribution Kit',
                    'AI Strategist Notes',
                ],
                journeyStages: ['Awareness', 'Education', 'Engagement', 'Trust', 'Value', 'Conversion', 'Action'],
                messageFlow: ['Hook', 'Problem', 'Insight', 'Solution', 'Proof', 'CTA'],
                productionStages: ['Idea', 'Draft', 'Design', 'Review', 'Approved', 'Published'],
            } });
    };
    return MiroSyncService;
}());
export { MiroSyncService };
export var miroSyncService = new MiroSyncService();
export var createMiroSyncPayload = function (campaign) { return miroSyncService.buildPayload(campaign); };
