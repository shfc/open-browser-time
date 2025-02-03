import { displayDateRange } from '../src/helper';

const today = new Date("2025-01-01T00:00:00Z");
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

test('Today', () => {
    expect(displayDateRange(today, today, today)).toBe('Today, 1 January');
});

test('Yesterday', () => {
    expect(displayDateRange(yesterday, yesterday, today)).toBe('Yesterday, 31 December');
});

test('Same month', () => {
    expect(displayDateRange(new Date("2025-01-01T00:00:00Z"), new Date("2025-01-05T00:00:00Z"), today)).toBe('1 - 5 Jan');
});

test('Different month', () => {
    expect(displayDateRange(new Date("2025-01-01T00:00:00Z"), new Date("2025-02-05T00:00:00Z"), today)).toBe('1 Jan - 5 Feb');
});

test('Different year', () => {
    expect(displayDateRange(new Date("2025-01-01T00:00:00Z"), new Date("2026-02-05T00:00:00Z"), today)).toBe('1 Jan 2025 - 5 Feb 2026');
});