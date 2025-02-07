import axios from "axios";

const API_BASE_URL = "https://api.boardroom.info/v1";

export class BoardroomClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        if (!this.apiKey || typeof this.apiKey !== 'string' || this.apiKey.trim() === '') {
            throw new Error("Valid Boardroom API key is required");
        }
    }

    /**
     * Fetch all proposals for a specific protocol.
     * @param protocolId - The ID of the protocol.
     * @returns List of proposals for the protocol.
     */
    async fetchProposals(protocolId: string): Promise<any> {
        try {
            const cleanProtocolId = protocolId
                .toLowerCase()
                .replace(".eth", "");
            console.log(
                `Fetching proposals for ${cleanProtocolId} from Boardroom API`,
            );
            const response = await axios.get(
                `${API_BASE_URL}/protocols/${cleanProtocolId}/proposals`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    params: {
                        limit: 10,
                        orderBy: "created",
                        orderDirection: "desc",
                    },
                },
            );

            if (!response.data || !response.data.data) {
                console.log("API Response:", response);
                throw new Error("Invalid response format from Boardroom API");
            }

            console.log(
                `Retrieved ${response.data.data.length} proposals for ${cleanProtocolId}`,
            );
            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error fetching proposals:",
                error.response?.data || error.message,
            );
            throw error;
        }
    }
}
