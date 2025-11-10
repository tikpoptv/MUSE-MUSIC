export interface ShareLinkResponse {
  processingID: string;
  shortLink: string;
  shareUrl: string;
  alreadyExists: boolean;
}

export interface ProcessingByShareLink {
  processingID: string;
  songID: string;
}

