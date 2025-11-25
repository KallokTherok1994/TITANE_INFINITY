/**
 * TITANE∞ v∞ Phase 4 - Multi-Agent System
 * Agent: Watchdog
 * Rôle: Surveillance agents, sécurité, détection corruption
 */

import type { Agent, AgentState, AgentEvent, AgentResponse, AgentRole } from '../multi_agent_engine';

interface SecurityAlert {
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId: string;
  type: string;
  description: string;
  autoResolved: boolean;
}

interface AgentAudit {
  agentId: string;
  lastCheck: number;
  violations: number;
  suspicionScore: number; // 0-100
  status: 'trusted' | 'monitored' | 'suspicious' | 'blocked';
}

export class WatchdogAgent implements Agent {
  public id = 'watchdog';
  public name = 'Watchdog';
  public role: AgentRole = 'security';
  public description = 'Agent de surveillance et sécurité';
  public permissions = ['security:monitor', 'agent:pause', 'agent:inspect'];

  public state: AgentState = {
    status: 'idle',
    lastTick: 0,
    cycleCount: 0,
    health: 100,
    load: 0,
    errors: [],
    metrics: {},
  };

  private alerts: SecurityAlert[] = [];
  private audits: Map<string, AgentAudit> = new Map();
  private blockedAgents: Set<string> = new Set();
  private eventHistory: AgentEvent[] = [];

  // Security thresholds
  private readonly MAX_ERRORS_PER_MINUTE = 10;
  private readonly MAX_LOAD_SUSTAINED = 95; // 95% for 5+ minutes
  private readonly SUSPICION_THRESHOLD = 70;

  async initialize(): Promise<void> {
    this.state.status = 'active';
    console.log('[Watchdog] Security monitoring active');
  }

  async shutdown(): Promise<void> {
    this.state.status = 'idle';
    await this.generateSecurityReport();
  }

  async tick(): Promise<void> {
    this.state.cycleCount++;
    this.state.lastTick = Date.now();

    // Monitor all registered agents (would get from engine)
    // For now, simulate monitoring
    this.auditAgents();
    this.detectAnomalies();
    this.enforceSecurityPolicies();

    this.updateMetrics();
  }

  async pause(): Promise<void> {
    this.state.status = 'paused';
    console.log('[Watchdog] Monitoring paused');
  }

  async resume(): Promise<void> {
    this.state.status = 'active';
    console.log('[Watchdog] Monitoring resumed');
  }

  async handle(event: AgentEvent): Promise<AgentResponse> {
    // Log all events for audit trail
    this.eventHistory.push(event);
    if (this.eventHistory.length > 500) this.eventHistory.shift();

    // Analyze event for security concerns
    this.analyzeEvent(event);

    if (event.type === 'agent:error') {
      return this.handleAgentError(event);
    }

    if (event.type === 'security:alert') {
      return this.escalateAlert(event.payload);
    }

    if (event.type === 'watchdog:report') {
      return this.generateSecurityReport();
    }

    return { success: true, data: 'Event logged' };
  }

  // Audit all agents
  private auditAgents(): void {
    // In real implementation, would get agent list from engine
    // For now, simulate auditing known agents
    const knownAgents = ['helios', 'harmonia', 'persona', 'memory-core'];

    knownAgents.forEach((agentId) => {
      if (!this.audits.has(agentId)) {
        this.audits.set(agentId, {
          agentId,
          lastCheck: Date.now(),
          violations: 0,
          suspicionScore: 0,
          status: 'trusted',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const audit = this.audits.get(agentId)!; // Safe: just created above if not exists

      // Check for suspicious patterns
      const recentErrors = this.countRecentErrors(agentId, 60000); // Last minute
      if (recentErrors > this.MAX_ERRORS_PER_MINUTE) {
        audit.violations++;
        audit.suspicionScore = Math.min(100, audit.suspicionScore + 20);
        this.createAlert('high', agentId, 'excessive_errors',
          `${recentErrors} errors in 1 minute`);
      }

      // Update status based on suspicion score
      if (audit.suspicionScore >= this.SUSPICION_THRESHOLD) {
        audit.status = 'suspicious';
        if (audit.suspicionScore >= 90) {
          audit.status = 'blocked';
          this.blockedAgents.add(agentId);
        }
      } else if (audit.suspicionScore > 40) {
        audit.status = 'monitored';
      } else {
        audit.status = 'trusted';
      }

      // Decay suspicion over time (forgiveness)
      if (recentErrors === 0) {
        audit.suspicionScore = Math.max(0, audit.suspicionScore - 1);
      }

      audit.lastCheck = Date.now();
    });
  }

  // Detect system-wide anomalies
  private detectAnomalies(): void {
    // Check for unusual event patterns
    const recentEvents = this.eventHistory.filter(
      (e) => e.timestamp > Date.now() - 60000
    );

    // Too many high-priority events
    const criticalCount = recentEvents.filter((e) => e.priority === 'critical').length;
    if (criticalCount > 5) {
      this.createAlert('critical', 'system', 'event_storm',
        `${criticalCount} critical events in 1 minute`);
    }

    // Check for event loops (same event repeated)
    const eventTypes = recentEvents.map((e) => e.type);
    const typeCounts = eventTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > 20) {
        this.createAlert('high', 'system', 'event_loop',
          `Event type "${type}" repeated ${count} times`);
      }
    });
  }

  // Enforce security policies
  private enforceSecurityPolicies(): void {
    // Block agents with high suspicion
    this.blockedAgents.forEach((agentId) => {
      console.warn(`[Watchdog] Agent ${agentId} is BLOCKED due to security concerns`);
      // In real implementation, would call engine.pauseAgent(agentId)
    });

    // Auto-resolve old alerts (cleanup)
    const oneHourAgo = Date.now() - 3600000;
    this.alerts = this.alerts.filter((alert) => {
      if (alert.timestamp < oneHourAgo && alert.severity === 'low') {
        alert.autoResolved = true;
        return false;
      }
      return true;
    });
  }

  // Analyze individual event for security
  private analyzeEvent(event: AgentEvent): void {
    // Check for unauthorized actions
    if (event.type.startsWith('admin:') && event.source !== 'system') {
      this.createAlert('critical', event.source, 'unauthorized_action',
        `Agent attempted admin action: ${event.type}`);
    }

    // Check for suspicious data patterns
    if (event.data && typeof event.data === 'object') {
      const dataStr = JSON.stringify(event.data);
      if (dataStr.includes('<script>') || dataStr.includes('eval(')) {
        this.createAlert('critical', event.source, 'code_injection',
          'Potential code injection detected in event data');
      }
    }
  }

  // Handle agent error
  private handleAgentError(event: AgentEvent): AgentResponse {
    const agentId = event.source;
    const audit = this.audits.get(agentId);

    if (audit) {
      audit.violations++;
      audit.suspicionScore = Math.min(100, audit.suspicionScore + 5);
    }

    // Create alert if error is severe
    if (event.priority === 'critical') {
      const errorMsg = (event.data && typeof event.data === 'object' && 'message' in event.data)
        ? String(event.data.message)
        : 'Unknown error';
      this.createAlert('high', agentId, 'critical_error', errorMsg);
    }

    return {
      success: true,
      message: 'Error logged and analyzed',
      data: { audit },
    };
  }

  // Create security alert
  private createAlert(
    severity: SecurityAlert['severity'],
    agentId: string,
    type: string,
    description: string
  ): void {
    const alert: SecurityAlert = {
      timestamp: Date.now(),
      severity,
      agentId,
      type,
      description,
      autoResolved: false,
    };

    this.alerts.push(alert);
    if (this.alerts.length > 200) this.alerts.shift(); // Keep last 200

    console.warn(`[Watchdog] ${severity.toUpperCase()} ALERT: ${agentId} - ${type} - ${description}`);
  }

  // Escalate alert to system
  private escalateAlert(data: unknown): AgentResponse {
    // In real implementation, would trigger notifications, emails, etc.
    console.error('[Watchdog] ESCALATED ALERT:', data);

    return {
      success: true,
      data: 'Alert escalated to system administrators',
    };
  }

  // Count recent errors for an agent
  private countRecentErrors(agentId: string, timeWindowMs: number): number {
    const cutoff = Date.now() - timeWindowMs;
    return this.eventHistory.filter(
      (e) =>
        e.source === agentId &&
        e.type === 'agent:error' &&
        e.timestamp > cutoff
    ).length;
  }

  // Generate security report
  private async generateSecurityReport(): Promise<AgentResponse> {
    const report = {
      timestamp: Date.now(),
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter((a) => a.severity === 'critical').length,
      highAlerts: this.alerts.filter((a) => a.severity === 'high').length,
      blockedAgents: Array.from(this.blockedAgents),
      agentAudits: Array.from(this.audits.values()),
      recentAlerts: this.alerts.slice(-20), // Last 20 alerts
    };

    console.log('[Watchdog] Security Report:', report);

    return {
      success: true,
      data: { report },
    };
  }

  // Update internal metrics
  private updateMetrics(): void {
    const criticalAlerts = this.alerts.filter((a) => a.severity === 'critical').length;
    const suspiciousAgents = Array.from(this.audits.values()).filter(
      (a) => a.status === 'suspicious' || a.status === 'blocked'
    ).length;

    this.state.data = {
      totalAlerts: this.alerts.length,
      criticalAlerts,
      blockedAgents: this.blockedAgents.size,
      suspiciousAgents,
      eventsMonitored: this.eventHistory.length,
    };

    // Health degrades with critical alerts
    this.state.health = Math.max(0, 100 - criticalAlerts * 10);

    // Load based on monitoring activity
    this.state.load = Math.min(100, (this.eventHistory.length / 500) * 100);
  }

  // Emit event to other agents
  emit(event: AgentEvent): void {
    console.log(`[Watchdog] Emitting event: ${event.type}`);
  }

  // Get current health
  getHealth(): number {
    return this.state.health;
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return this.state.metrics;
  }
}
