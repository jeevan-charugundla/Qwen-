export declare const MIRO_BOARD_URL = "https://miro.com/app/board/uXjVEervLkQ=/";
export type SyncContentItem = {
    contentId?: string;
    day: number;
    platform: string;
    format: string;
    topic: string;
    hook: string;
    caption: string;
    cta: string;
    creativeBrief: string;
    status: string;
    creativeConcept?: string;
    creativePrompt?: string;
    visualStyle?: string;
    composition?: string;
    subject?: string;
    lighting?: string;
    colorDirection?: string;
    aspectRatio?: string;
    generatedImage?: {
        id: string;
        url: string;
        prompt: string;
    };
};
export type SyncCampaign = {
    campaignId: string;
    campaignName: string;
    brand: string;
    campaignObjective: string;
    targetAudience: string;
    duration: number;
    contentPillars: {
        name: string;
        purpose: string;
    }[];
    calendar: SyncContentItem[];
    generatedImages?: {
        id: string;
        url: string;
        prompt: string;
    }[];
};
export type MiroSyncPayload = SyncCampaign & {
    boardUrl: string;
    sectionKey: string;
    workspace: {
        sections: string[];
        journeyStages: string[];
        messageFlow: string[];
        productionStages: string[];
    };
};
export declare class MiroSyncService {
    buildPayload(campaign: SyncCampaign): MiroSyncPayload;
}
export declare const miroSyncService: MiroSyncService;
export declare const createMiroSyncPayload: (campaign: SyncCampaign) => MiroSyncPayload;
