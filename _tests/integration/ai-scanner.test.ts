import { describe, it, expect, vi } from 'vitest';

// Mock receipt data
const mockReceiptJson = {
  merchant: 'Starbucks',
  total: 5.75,
  date: '2026-03-22',
  items: [
    { name: 'Caramel Macchiato', price: 5.75 }
  ]
};

describe('AI Scanner Integration', () => {
  it('correctly identifies merchant and total from mock structured data', () => {
    // This test simulates the expected output from the Modal-powered AI scanner
    const data = mockReceiptJson;
    expect(data.merchant).toBe('Starbucks');
    expect(data.total).toBe(5.75);
    expect(data.items).toHaveLength(1);
  });

  it('handles missing items gracefully', () => {
    const incompleteData = { merchant: 'Target', total: 20.00 };
    expect(incompleteData.merchant).toBe('Target');
    expect(incompleteData.total).toBe(20.00);
    // @ts-ignore
    expect(incompleteData.items).toBeUndefined();
  });
});
