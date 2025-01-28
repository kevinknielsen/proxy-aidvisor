import { Provider } from '@eliza/core';
import { BoardroomClient } from './boardroomClient';

export class BoardroomProvider extends Provider {
    private client: BoardroomClient;

    constructor(apiKey: string) {
        super();
        this.client = new BoardroomClient(apiKey);
    }

    /**
     * Get all proposals for a specific protocol.
     * @param protocolId - The ID of the protocol.
     * @returns List of proposals.
     */
    async getProposals(protocolId: string) {
        return this.client.fetchProposals(protocolId);
    }
}

export default BoardroomProvider;
