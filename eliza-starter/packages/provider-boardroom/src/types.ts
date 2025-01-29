export interface Proposal {
  refId: string;
  id: string;
  title: string;
  content: string;
  protocol: string;
  adapter: string;
  proposer: string;
  totalVotes: number;
  blockNumber: number;
  externalUrl: string;
  startTime: {
      timestamp: number;
  };
  endTime: {
      timestamp: number;
  };
  startTimestamp: string;
  endTimestamp: string;
  currentState: string;
  choices: string[];
  results: Array<{
      total: number;
      choice: number;
  }>;
  events: Array<{
      type: string;
      indexedResult: Array<{
          summary: string;
          privacy: string;
      }>;
      indexedAt: number;
      txHash: string;
      quorum: number;
  }>;
}

export interface APIResponse {
  data: Proposal[]; // Array of proposals
  nextCursor?: string; // Optional cursor for paginated data
}