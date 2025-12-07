import { describe, it, expect } from '@jest/globals';
import { Sanitizer } from '../../src/security/Sanitizer';

describe('🔐 Advanced Security Tests', () => {
  describe('XSS Attack Vectors', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '<svg/onload=alert("xss")>',
      'javascript:alert("xss")',
      '<iframe src="javascript:alert(\'xss\')">',
      '<body onload=alert("xss")>',
      '<input onfocus=alert("xss") autofocus>',
      '<select onfocus=alert("xss") autofocus>',
      '<textarea onfocus=alert("xss") autofocus>',
      '<marquee onstart=alert("xss")>',
      '<details open ontoggle=alert("xss")>',
    ];

    it.each(xssPayloads)('should sanitize: %s', payload => {
      const sanitized = Sanitizer.sanitizeHtml(payload);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
    });
  });

  describe('SQL Injection Patterns', () => {
    const sqlInjections = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT NULL--",
      '1; DELETE FROM users WHERE 1=1--',
    ];

    it.each(sqlInjections)('should block: %s', injection => {
      const input = Sanitizer.sanitizeUserInput(injection);
      expect(input).not.toContain('DROP');
      expect(input).not.toContain('UNION');
      expect(input).not.toContain('DELETE');
    });
  });

  describe('Path Traversal', () => {
    const pathTraversals = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '....//....//....//etc/passwd',
      'file:///etc/passwd',
    ];

    it.each(pathTraversals)('should sanitize filename: %s', path => {
      const sanitized = Sanitizer.sanitizeUserInput(path);
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('..\\');
      expect(sanitized).not.toContain('file://');
    });
  });

  describe('LDAP Injection', () => {
    it('should escape special LDAP characters', () => {
      const input = '*)(uid=*))(|(uid=*';
      const sanitized = Sanitizer.sanitizeUserInput(input);
      expect(sanitized).not.toContain('*)(');
      expect(sanitized).not.toContain('|(');
    });
  });

  describe('Command Injection', () => {
    const commandInjections = [
      '; rm -rf /',
      '| cat /etc/passwd',
      '`whoami`',
      '$(whoami)',
    ];

    it.each(commandInjections)('should block: %s', cmd => {
      const sanitized = Sanitizer.sanitizeUserInput(cmd);
      expect(sanitized).not.toContain('rm -rf');
      expect(sanitized).not.toContain('cat /etc');
      expect(sanitized).not.toMatch(/[`$()]/);
    });
  });
});
