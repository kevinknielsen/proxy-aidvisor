import axios from 'axios';

const API_BASE_URL = 'https://api.boardroom.info/v1';

export class BoardroomClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Fetch all proposals for a specific protocol.
     * @param protocolId - The ID of the protocol.
     * @returns List of proposals for the protocol.
     */
    async fetchProposals(protocolId: string): Promise<any> {
        try {
            const cleanProtocolId = protocolId.replace('.eth', '');
            console.log(`Fetching proposals for ${cleanProtocolId} from Boardroom API`);
            const response = await axios.get(`${API_BASE_URL}/protocols/${cleanProtocolId}/proposals`, {
                headers: { 
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.data) {
                throw new Error('No data received from Boardroom API');
            }
            
            console.log(`Received response from Boardroom API for ${cleanProtocolId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching proposals:', error.response?.data || error.message);
            throw error;
        }
    }
}