import { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import { BoardroomClient } from './boardroomClient';

export class BoardroomProvider implements Provider {
    private client: BoardroomClient;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('Boardroom API key is required');
        }
        console.log('Initializing BoardroomClient with API key');
        this.client = new BoardroomClient(apiKey);
    }

    async get(
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State
    ): Promise<string> {
        try {
            const content = typeof message.content === "string" 
                ? message.content 
                : message.content?.text;

            if (!content) {
                throw new Error("No message content provided");
            }

            const protocolId = this.extractProtocolId(content);
            if (!protocolId) {
                throw new Error("Could not identify protocol in message");
            }

            console.log(`Fetching proposals for protocol: ${protocolId}`);
            
            const proposals = await this.client.fetchProposals(protocolId);
            return this.formatProposalsData(proposals);

        } catch (error) {
            console.error("BoardroomProvider error:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return `Error: ${errorMessage}`;
        }
    }

    private extractProtocolId(content: string): string | null {
        // First try to match explicit protocol format with optional .eth
        let match = content.match(/protocol[:\s]+([a-zA-Z0-9-.]+)(\.eth)?/i);
        if (match) return match[1].toLowerCase();
        
        // Then try to find protocol name with optional .eth
        const protocols = ['aave', 'uniswap', 'compound', 'maker'];
        const words = content.toLowerCase().split(/[\s,.!?]+/);
        
        for (const word of words) {
            const base = word.replace(/\.eth$/, '');
            if (protocols.includes(base)) {
                return word; // Return full word including .eth if present
            }
        }
        
        return null;
    }

    private formatProposalsData(proposals: any[]): string {
        if (!proposals.length) {
            return "No proposals found for this protocol.";
        }

        return `Found ${proposals.length} proposals:\n${proposals
            .map((p, i) => `${i + 1}. ${p.title || 'Untitled'} (Status: ${p.status || 'Unknown'})`)
            .join('\n')}`;
    }
}

export default BoardroomProvider;