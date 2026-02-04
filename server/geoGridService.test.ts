import { describe, it, expect } from 'vitest';
import { generateMockGeoGridData } from './geoGridService';

describe('GeoGrid Service', () => {
  it('should generate mock GeoGrid data with correct structure', () => {
    const businessName = 'Test Pizza';
    const keyword = 'pizza new york';
    const centerLat = 40.7128;
    const centerLng = -74.0060;
    const gridSize = 5;

    const result = generateMockGeoGridData(businessName, keyword, centerLat, centerLng, gridSize);

    // Check basic structure
    expect(result.businessName).toBe(businessName);
    expect(result.keyword).toBe(keyword);
    expect(result.centerLat).toBe(centerLat);
    expect(result.centerLng).toBe(centerLng);
    expect(result.gridSize).toBe(gridSize);

    // Check grid dimensions
    expect(result.points).toHaveLength(gridSize);
    result.points.forEach(row => {
      expect(row).toHaveLength(gridSize);
    });

    // Check point structure
    const firstPoint = result.points[0][0];
    expect(firstPoint).toHaveProperty('lat');
    expect(firstPoint).toHaveProperty('lng');
    expect(firstPoint).toHaveProperty('rank');
    expect(firstPoint).toHaveProperty('competitors');
    expect(firstPoint).toHaveProperty('distance');

    // Check statistics
    expect(result.averageRank).toBeGreaterThanOrEqual(0);
    expect(result.visibility).toBeGreaterThanOrEqual(0);
    expect(result.visibility).toBeLessThanOrEqual(100);
  });

  it('should generate 7x7 grid when specified', () => {
    const result = generateMockGeoGridData('Test Business', 'test keyword', 40.7128, -74.0060, 7);

    expect(result.gridSize).toBe(7);
    expect(result.points).toHaveLength(7);
    result.points.forEach(row => {
      expect(row).toHaveLength(7);
    });
  });

  it('should have better ranks near center', () => {
    const result = generateMockGeoGridData('Test Business', 'test keyword', 40.7128, -74.0060, 5);

    const centerPoint = result.points[2][2]; // Middle of 5x5 grid
    const cornerPoint = result.points[0][0]; // Top-left corner

    // Center should have rank (not null) and likely better than corner
    expect(centerPoint.rank).not.toBeNull();
    
    if (centerPoint.rank !== null && cornerPoint.rank !== null) {
      expect(centerPoint.rank).toBeLessThanOrEqual(cornerPoint.rank);
    }
  });

  it('should include competitor data for each point', () => {
    const result = generateMockGeoGridData('Test Business', 'test keyword', 40.7128, -74.0060, 5);

    result.points.forEach(row => {
      row.forEach(point => {
        expect(point.competitors).toBeInstanceOf(Array);
        expect(point.competitors.length).toBeGreaterThan(0);
        
        point.competitors.forEach(competitor => {
          expect(competitor).toHaveProperty('name');
          expect(competitor).toHaveProperty('rank');
          expect(typeof competitor.name).toBe('string');
          expect(typeof competitor.rank).toBe('number');
        });
      });
    });
  });

  it('should calculate distance from center', () => {
    const result = generateMockGeoGridData('Test Business', 'test keyword', 40.7128, -74.0060, 5);

    result.points.forEach(row => {
      row.forEach(point => {
        expect(point.distance).toMatch(/\d+(\.\d+)?\s*(ft|mi)/);
      });
    });
  });
});
