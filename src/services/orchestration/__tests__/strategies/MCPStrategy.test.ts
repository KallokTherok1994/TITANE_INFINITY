/**
 * TITANE∞ vΩ — MCPStrategy Unit Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MCPStrategy } from '../../strategies/MCPStrategy';

describe('MCPStrategy', () => {
  let strategy: MCPStrategy;

  beforeEach(() => {
    strategy = new MCPStrategy();
  });

  afterEach(async () => {
    await strategy.shutdown();
  });

  describe('Initialization', () => {
    it('should create strategy', () => {
      expect(strategy).toBeDefined();
      expect(strategy.type).toBe('mcp');
      expect(strategy.isInitialized()).toBe(false);
    });

    it('should initialize MCP governance', async () => {
      await strategy.initialize();
      expect(strategy.isInitialized()).toBe(true);
    });
  });

  describe('Job Operations', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should create job', async () => {
      const jobId = await strategy.createJob('test', 'medium');
      expect(jobId).toBeDefined();
      expect(jobId).toMatch(/^job_/);
    });

    it('should evaluate job', async () => {
      const jobId = await strategy.createJob('test', 'high');
      const result = await strategy.evaluateJob(jobId);
      
      expect(result.status).toBeDefined();
    });

    it('should list jobs', async () => {
      await strategy.createJob('test1', 'low');
      await strategy.createJob('test2', 'high');
      
      const jobs = strategy.listJobs();
      expect(jobs.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter jobs by status', async () => {
      await strategy.createJob('test', 'medium');
      
      const pendingJobs = strategy.listJobs({ status: 'pending' });
      expect(pendingJobs.every(j => j.status === 'pending')).toBe(true);
    });
  });

  describe('Health Scans', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should scan stability', async () => {
      const result = await strategy.scanStability();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should scan coherence', async () => {
      const result = await strategy.scanCoherence();
      expect(result.status).toBeDefined();
    });

    it('should scan cognitive load', async () => {
      const result = await strategy.scanCognitiveLoad();
      expect(result.score).toBeDefined();
    });

    it('should scan security', async () => {
      const result = await strategy.scanSecurity();
      expect(result.status).toBe('secure');
    });

    it('should scan memory', async () => {
      const result = await strategy.scanMemory();
      expect(result.status).toBe('healthy');
    });
  });

  describe('Health Monitoring', () => {
    it('should check health', async () => {
      await strategy.initialize();
      
      const health = await strategy.checkHealth();
      expect(health.status).toBeDefined();
      expect(health.score).toBeGreaterThanOrEqual(0);
    });

    it('should get health score', async () => {
      await strategy.initialize();
      
      const score = strategy.getHealthScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Metrics', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should record metrics', async () => {
      await strategy.createJob('test', 'low');
      
      const metrics = strategy.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should get metrics summary', async () => {
      await strategy.createJob('test', 'medium');
      
      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should reset metrics', async () => {
      await strategy.createJob('test', 'high');
      strategy.reset();
      
      const metrics = strategy.getMetrics();
      expect(metrics.length).toBe(0);
    });
  });
});
