import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService, NotFoundError } from './report.service';
import { ReportDto } from '@/types';
import * as supabaseServer from '@/lib/supabase-server';
import { createMockSupabaseClient, MockSupabaseClient } from '@/test/setup';

vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn()
}));

describe('ReportService', () => {
  let reportService: ReportService;
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Create a new instance of the service
    reportService = new ReportService();
    
    // Setup mock Supabase client
    mockSupabase = createMockSupabaseClient();
    
    // Mock the createClient function
    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase);
  });

  describe('getReportDetails', () => {
    it('should successfully return a report when it exists and belongs to the user', async () => {
      // Arrange
      const mockReportId = 1;
      const mockUserId = '2';
      const mockReportData = {
        id: mockReportId,
        user_id: mockUserId,
        title: 'Test Report',
        original_text: 'Original text content',
        summary: 'Summary content',
        conclusions: 'Conclusions content',
        key_data: 'Key data content',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      // Configure mock to return the report
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockReportData,
        error: null
      });
      
      // Act
      const result = await reportService.getReportDetails(mockReportId);
      
      // Assert
      expect(result).toEqual({
        id: mockReportId,
        userId: mockUserId,
        title: 'Test Report',
        originalText: 'Original text content',
        summary: 'Summary content',
        conclusions: 'Conclusions content',
        keyData: 'Key data content',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      } as ReportDto);
      
      // Verify interactions
      expect(mockSupabase.from).toHaveBeenCalledWith('reports');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('id', mockReportId);
    });
    
    it('should throw NotFoundError when report does not exist', async () => {
      // Arrange
      const mockReportId = 999;
      
      // Configure mock to return not found error
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      });
      
      // Act & Assert
      await expect(reportService.getReportDetails(mockReportId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw NotFoundError when data is null but no error', async () => {
      // Arrange
      const mockReportId = 999;
      
      // Configure mock to return not found error
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: null
      });
      
      // Act & Assert
      await expect(reportService.getReportDetails(mockReportId))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw error when query fails with non-PGRST116 error', async () => {
      // Arrange
      const mockReportId = 1;
      
      // Konfigurujemy mock do zwrócenia błędu, który nie jest PGRST116
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Query failed', code: 'OTHER_ERROR' }
      });
      
      // Act & Assert
      // Oczekujemy, że błąd będzie przekazany dalej z zachowaniem jego właściwości
      await expect(reportService.getReportDetails(mockReportId))
        .rejects
        .toHaveProperty('message', 'Query failed');
    });
  });
}); 