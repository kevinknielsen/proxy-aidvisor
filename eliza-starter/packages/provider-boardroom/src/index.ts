import { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';
import { BoardroomClient } from './boardroomClient';

export class BoardroomProvider implements Provider {
    private client: BoardroomClient;

    constructor(apiKey: string) {
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
            return `Error: ${error.message}`;
        }
    }

    private extractProtocolId(content: string): string | null {
        // Basic extraction - can be enhanced based on requirements
        const match = content.match(/protocol[:\s]+([a-zA-Z0-9-]+)/i);
        return match ? match[1].toLowerCase() : null;
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