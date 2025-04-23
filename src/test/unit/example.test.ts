import { describe, it, expect, vi } from 'vitest';

// Funkcja do testowania
function sumNumbers(a: number, b: number): number {
  return a + b;
}

// Przykładowa funkcja asynchroniczna
async function fetchData(): Promise<string> {
  return 'data';
}

describe('Przykładowe testy jednostkowe', () => {
  it('powinien poprawnie dodawać dwie liczby', () => {
    // Arrange
    const a = 1;
    const b = 2;
    
    // Act
    const result = sumNumbers(a, b);
    
    // Assert
    expect(result).toBe(3);
  });
  
  it('powinien obsługiwać zapytania asynchroniczne', async () => {
    // Arrange & Act
    const data = await fetchData();
    
    // Assert
    expect(data).toBe('data');
  });
  
  it('powinien mockować funkcje', () => {
    // Arrange
    const mockFn = vi.fn(() => 'mocked result');
    
    // Act
    const result = mockFn();
    
    // Assert
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result).toBe('mocked result');
  });
  
  it('powinien używać spy na istniejących funkcjach', () => {
    // Arrange
    const spy = vi.spyOn(console, 'log');
    
    // Act
    console.log('test');
    
    // Assert
    expect(spy).toHaveBeenCalledWith('test');
    
    // Clean up
    spy.mockRestore();
  });
}); 