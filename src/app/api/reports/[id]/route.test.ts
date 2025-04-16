import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { ReportService } from '@/reports/report.service';
import { Mock } from 'vitest';

// Mock the ReportService
vi.mock('@/reports/report.service', () => ({
  ReportService: vi.fn(() => ({
    getReportDetails: vi.fn()
  }))
}));

describe('GET /api/reports/[id]', () => {
  let mockRequest: NextRequest;
  let mockParams: { id: string };
  let mockReportService: {
    getReportDetails: Mock;
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Create mock request
    mockRequest = new NextRequest('http://localhost/api/reports/1', {
      headers: {
        'x-user-id': '2'
      }
    });
    
    // Set up params
    mockParams = { id: '1' };
    
    // Get mock report service instance
    const MockReportServiceClass = ReportService as unknown as ReturnType<typeof vi.fn>;
    mockReportService = new MockReportServiceClass();
  });

  it('should return 200 and report details when report exists', async () => {
    // Arrange
    const mockReport = {
      id: 1,
      userId: 2,
      title: 'Test Report',
      originalText: 'Original text content',
      summary: 'Summary content',
      conclusions: 'Conclusions content',
      keyData: 'Key data content',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    };
    
    mockReportService.getReportDetails.mockResolvedValue(mockReport);
    
    // Act
    const response = await GET(mockRequest, { params: mockParams });
    
    // Assert
    expect(response.status).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toEqual(mockReport);
    
    // Verify interactions
    expect(mockReportService.getReportDetails).toHaveBeenCalledWith(1, 2);
  });

  it('should return report details when valid ID is provided', async () => {
    // Arrange
    const mockReport = {
      id: '1',
      title: 'Test Report',
      content: 'Test Content'
    };
    mockReportService.getReportDetails.mockResolvedValue(mockReport);

    // Act
    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(mockReport);
    expect(mockReportService.getReportDetails).toHaveBeenCalledWith('1', '2');
  });

  it('should return 400 when report ID is invalid', async () => {
    // Arrange
    mockParams.id = 'invalid-id';

    // Act
    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid report ID' });
    expect(mockReportService.getReportDetails).not.toHaveBeenCalled();
  });

  it('should return 401 when user ID is missing', async () => {
    // Arrange
    mockRequest = new NextRequest('http://localhost/api/reports/1');

    // Act
    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockReportService.getReportDetails).not.toHaveBeenCalled();
  });

  it('should return 404 when report is not found', async () => {
    // Arrange
    mockReportService.getReportDetails.mockRejectedValue(new Error('Report not found'));

    // Act
    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Report not found' });
    expect(mockReportService.getReportDetails).toHaveBeenCalledWith('1', '2');
  });

  it('should return 500 when unexpected error occurs', async () => {
    // Arrange
    mockReportService.getReportDetails.mockRejectedValue(new Error('Database error'));

    // Act
    const response = await GET(mockRequest, { params: mockParams });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
    expect(mockReportService.getReportDetails).toHaveBeenCalledWith('1', '2');
  });
}); 