/// <reference types="jest" />
import { BoardroomClient } from '../src/boardroomClient';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BoardroomClient', () => {
    const apiKey = 'test-api-key';
    const client = new BoardroomClient(apiKey);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchProposals', () => {
        const protocolId = 'test-protocol';
        const mockProposals = {
            data: [
                { id: '1', title: 'Proposal 1' },
                { id: '2', title: 'Proposal 2' }
            ]
        };

        it('should successfully fetch proposals', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: mockProposals });

            const result = await client.fetchProposals(protocolId);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `https://api.boardroom.info/v1/protocols/${protocolId}/proposals`,
                { headers: { Authorization: `Bearer ${apiKey}` } }
            );
            expect(result).toEqual(mockProposals);
        });

        it('should handle API errors', async () => {
            const errorMessage = 'API Error';
            mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

            await expect(client.fetchProposals(protocolId)).rejects.toThrow(errorMessage);
        });
    });
});
