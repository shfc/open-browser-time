import {formatSecondsToString, formatDate, isSameDate, getOffsetDate } from '../src/utils';

describe('Utils functions', () => {
    test('formatSecondsToString should format seconds correctly', () => {
        expect(formatSecondsToString(3600)).toBe('1h.');
        expect(formatSecondsToString(60)).toBe('1min.');
        expect(formatSecondsToString(1)).toBe('1s.');
        expect(formatSecondsToString(3661)).toBe('1h 1min.');
    });

    test('formatDate should return date in YYYY-MM-DD format', () => {
        const date = new Date('2023-10-05');
        expect(formatDate(date)).toBe('2023-10-05');
    });

    test('isSameDate should return true for same dates', () => {
        const date1 = new Date('2023-10-05');
        const date2 = new Date('2023-10-05');
        expect(isSameDate(date1, date2)).toBe(true);
    });

    test('isSameDate should return false for different dates', () => {
        const date1 = new Date('2023-10-05');
        const date2 = new Date('2023-10-06');
        expect(isSameDate(date1, date2)).toBe(false);
    });

    test('getOffsetDate should return date with offset', () => {
        const date = new Date('2023-10-05');
        const offsetDate = getOffsetDate(date, 5);
        expect(formatDate(offsetDate)).toBe('2023-10-10');
    });
});