export type GeneratedCampaignImage = {
    imageId: string;
    imageUrl: string;
    localPath: string;
    prompt: string;
};
export declare function generateCampaignImage(prompt: string, options?: {
    width?: number;
    height?: number;
}): Promise<GeneratedCampaignImage>;
