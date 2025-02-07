import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { BoardroomClient } from "./boardroomClient";

export class BoardroomProvider implements Provider {
    private client: BoardroomClient;

    constructor(apiKey?: string) {
        const boardroomKey = apiKey || process.env.BOARDROOM_API_KEY;
        if (!boardroomKey || typeof boardroomKey !== 'string' || boardroomKey.trim() === '') {
            throw new Error(
                "Valid Boardroom API key is required - set BOARDROOM_API_KEY in secrets",
            );
        }
        console.log("Initializing BoardroomClient with key");
        try {
            this.client = new BoardroomClient(boardroomKey);
        } catch (error) {
            console.error("Failed to initialize BoardroomClient:", error);
            throw error;
        }
    }

    async get(
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State,
    ): Promise<string> {
        try {
            const content =
                typeof message.content === "string"
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
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            return `Error: ${errorMessage}`;
        }
    }

    private extractProtocolId(content: string): string | null {
        const protocols = ["aave", "uniswap", "compound", "maker"];
        const words = content.toLowerCase().split(/[\s,.!?]+/);

        for (const word of words) {
            const base = word.replace(/\.eth$/, "").trim();
            if (protocols.includes(base)) {
                return base;
            }
        }

        return null;
    }

    private formatProposalsData(proposals: any[]): string {
        if (!proposals.length) {
            return "No proposals found for this protocol.";
        }

        return `Found ${proposals.length} proposals:\n${proposals
            .map(
                (p, i) =>
                    `${i + 1}. ${p.title || "Untitled"} (Status: ${p.status || "Unknown"})`,
            )
            .join("\n")}`;
    }
}

export default BoardroomProvider;
