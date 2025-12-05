/**
 * Unit Tests for Validators
 * 
 * Test Cases Selection based on:
 * - Equivalence Partitioning: Valid/Invalid email formats, phone lengths
 * - Boundary Value Analysis: Phone length limits (7-15 digits)
 * - Valid/Invalid data combinations
 */

const {
  validateEmail,
  validatePhone,
  validateName,
  validateDate,
  validateTime
} = require('../../middlewares/validators');

describe('Validators - Unit Tests', () => {
  
  // ========================================
  // EMAIL VALIDATION TESTS
  // ========================================
  describe('validateEmail', () => {
    
    // Valid email partition
    describe('Valid Emails (Equivalence Partition: Valid)', () => {
      test('should accept standard email format', () => {
        expect(validateEmail('test@email.com')).toBe(true);
      });

      test('should accept email with subdomain', () => {
        expect(validateEmail('user@sub.domain.com')).toBe(true);
      });

      test('should accept email with numbers', () => {
        expect(validateEmail('user123@email.com')).toBe(true);
      });

      test('should accept email with dots in local part', () => {
        expect(validateEmail('user.name@email.com')).toBe(true);
      });

      test('should accept email with plus sign', () => {
        expect(validateEmail('user+tag@email.com')).toBe(true);
      });
    });

    // Invalid email partition - missing @
    describe('Invalid Emails - Missing @ (Equivalence Partition: Invalid)', () => {
      test('should reject email without @', () => {
        expect(validateEmail('testemail.com')).toBe(false);
      });
    });

    // Invalid email partition - missing domain
    describe('Invalid Emails - Missing Domain (Equivalence Partition: Invalid)', () => {
      test('should reject email without domain', () => {
        expect(validateEmail('test@')).toBe(false);
      });

      test('should reject email without TLD', () => {
        expect(validateEmail('test@domain')).toBe(false);
      });
    });

    // Invalid email partition - missing local part
    describe('Invalid Emails - Missing Local Part (Equivalence Partition: Invalid)', () => {
      test('should reject email without local part', () => {
        expect(validateEmail('@email.com')).toBe(false);
      });
    });

    // Boundary value - empty string
    describe('Invalid Emails - Empty/Null (Boundary Value)', () => {
      test('should reject empty string', () => {
        expect(validateEmail('')).toBe(false);
      });

      test('should reject null', () => {
        expect(validateEmail(null)).toBe(false);
      });

      test('should reject undefined', () => {
        expect(validateEmail(undefined)).toBe(false);
      });
    });

    // Invalid email partition - spaces
    describe('Invalid Emails - With Spaces (Equivalence Partition: Invalid)', () => {
      test('should reject email with spaces', () => {
        expect(validateEmail('test @email.com')).toBe(false);
      });

      test('should reject email with only spaces', () => {
        expect(validateEmail('   ')).toBe(false);
      });
    });
  });

  // ========================================
  // PHONE VALIDATION TESTS
  // ========================================
  describe('validatePhone', () => {
    
    // Valid phone partition
    describe('Valid Phones (Equivalence Partition: Valid)', () => {
      test('should accept 10 digit phone', () => {
        expect(validatePhone('3001234567')).toBe(true);
      });

      test('should accept phone with spaces', () => {
        expect(validatePhone('300 123 4567')).toBe(true);
      });

      test('should accept phone with dashes', () => {
        expect(validatePhone('300-123-4567')).toBe(true);
      });
    });

    // Boundary value tests for phone length
    describe('Phone Length Boundaries (Boundary Value Analysis)', () => {
      test('should reject 6 digits (below minimum boundary)', () => {
        expect(validatePhone('123456')).toBe(false);
      });

      test('should accept 7 digits (minimum boundary)', () => {
        expect(validatePhone('1234567')).toBe(true);
      });

      test('should accept 8 digits (just above minimum)', () => {
        expect(validatePhone('12345678')).toBe(true);
      });

      test('should accept 14 digits (just below maximum)', () => {
        expect(validatePhone('12345678901234')).toBe(true);
      });

      test('should accept 15 digits (maximum boundary)', () => {
        expect(validatePhone('123456789012345')).toBe(true);
      });

      test('should reject 16 digits (above maximum boundary)', () => {
        expect(validatePhone('1234567890123456')).toBe(false);
      });
    });

    // Invalid phone partition - contains letters
    describe('Invalid Phones - Contains Letters (Equivalence Partition: Invalid)', () => {
      test('should reject phone with letters', () => {
        expect(validatePhone('300ABC4567')).toBe(false);
      });

      test('should reject phone with special characters', () => {
        expect(validatePhone('300@123#456')).toBe(false);
      });
    });

    // Boundary value - empty/null
    describe('Invalid Phones - Empty/Null (Boundary Value)', () => {
      test('should reject empty string', () => {
        expect(validatePhone('')).toBe(false);
      });

      test('should reject null', () => {
        expect(validatePhone(null)).toBe(false);
      });

      test('should reject undefined', () => {
        expect(validatePhone(undefined)).toBe(false);
      });
    });
  });

  // ========================================
  // NAME VALIDATION TESTS
  // ========================================
  describe('validateName', () => {
    
    // Valid name partition
    describe('Valid Names (Equivalence Partition: Valid)', () => {
      test('should accept normal name', () => {
        expect(validateName('Juan Pérez')).toBe(true);
      });

      test('should accept name with accents', () => {
        expect(validateName('María José')).toBe(true);
      });

      test('should accept single character (minimum boundary)', () => {
        expect(validateName('A')).toBe(true);
      });
    });

    // Boundary value - empty/null
    describe('Invalid Names - Empty/Null (Boundary Value)', () => {
      test('should reject empty string', () => {
        expect(validateName('')).toBe(false);
      });

      test('should reject only spaces', () => {
        expect(validateName('   ')).toBe(false);
      });

      test('should reject null', () => {
        expect(validateName(null)).toBe(false);
      });

      test('should reject undefined', () => {
        expect(validateName(undefined)).toBe(false);
      });
    });
  });

  // ========================================
  // DATE VALIDATION TESTS
  // ========================================
  describe('validateDate', () => {
    
    // Valid date partition
    describe('Valid Dates (Equivalence Partition: Valid)', () => {
      test('should accept today date', () => {
        const today = new Date().toISOString().split('T')[0];
        expect(validateDate(today)).toBe(true);
      });

      test('should accept future date', () => {
        const future = new Date();
        future.setDate(future.getDate() + 30);
        const futureStr = future.toISOString().split('T')[0];
        expect(validateDate(futureStr)).toBe(true);
      });
    });

    // Invalid date partition - past dates
    describe('Invalid Dates - Past Dates (Equivalence Partition: Invalid)', () => {
      test('should reject yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        expect(validateDate(yesterdayStr)).toBe(false);
      });
    });

    // Invalid date partition - wrong format
    describe('Invalid Dates - Wrong Format (Equivalence Partition: Invalid)', () => {
      test('should reject invalid format DD/MM/YYYY', () => {
        expect(validateDate('25/12/2024')).toBe(false);
      });

      test('should reject invalid date string', () => {
        expect(validateDate('not-a-date')).toBe(false);
      });
    });

    // Boundary value - empty/null
    describe('Invalid Dates - Empty/Null (Boundary Value)', () => {
      test('should reject empty string', () => {
        expect(validateDate('')).toBe(false);
      });

      test('should reject null', () => {
        expect(validateDate(null)).toBe(false);
      });
    });
  });

  // ========================================
  // TIME VALIDATION TESTS
  // ========================================
  describe('validateTime', () => {
    const validSlots = ['08:00', '09:00', '10:00', '14:00', '15:00'];

    // Valid time partition
    describe('Valid Times (Equivalence Partition: Valid)', () => {
      test('should accept valid time slot', () => {
        expect(validateTime('09:00', validSlots)).toBe(true);
      });

      test('should accept first slot (boundary)', () => {
        expect(validateTime('08:00', validSlots)).toBe(true);
      });

      test('should accept last slot (boundary)', () => {
        expect(validateTime('15:00', validSlots)).toBe(true);
      });
    });

    // Invalid time partition
    describe('Invalid Times (Equivalence Partition: Invalid)', () => {
      test('should reject time not in slots', () => {
        expect(validateTime('12:00', validSlots)).toBe(false);
      });

      test('should reject empty string', () => {
        expect(validateTime('', validSlots)).toBe(false);
      });

      test('should reject null', () => {
        expect(validateTime(null, validSlots)).toBe(false);
      });
    });
  });
});