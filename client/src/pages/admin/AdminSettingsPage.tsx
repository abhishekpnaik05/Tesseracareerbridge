import { useState } from "react";
import { User, Bell, Shield, Database } from "lucide-react";
import { Button } from "../../components/ui";

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "security" | "system">("account");

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Settings</h1>
          <p className="text-muted">Manage your admin account and platform settings</p>
        </div>

        {/* Settings Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "account" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <User />
            Account
          </button>
          <button
            className={`tab ${activeTab === "notifications" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell />
            Notifications
          </button>
          <button
            className={`tab ${activeTab === "security" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield />
            Security
          </button>
          <button
            className={`tab ${activeTab === "system" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <Database />
            System
          </button>
        </div>

        {activeTab === "account" && (
          <section className="section">
            <div className="section-header">
              <h2>Account Settings</h2>
            </div>
            <div className="detail-section">
              <form className="detail-card">
                <div className="form-group">
                  <label htmlFor="name">Display Name</label>
                  <input
                    id="name"
                    type="text"
                    defaultValue="Admin User"
                    className="filter-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    defaultValue="admin@tesseracareerbridge.com"
                    className="filter-input"
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <select id="timezone" className="filter-select">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="section">
            <div className="section-header">
              <h2>Notification Preferences</h2>
            </div>
            <div className="detail-section">
              <div className="detail-card">
                <NotificationSetting
                  title="New Student Registrations"
                  description="Receive notifications when new students register"
                  defaultChecked
                />
                <NotificationSetting
                  title="Mentor Assignments"
                  description="Get notified when mentors are assigned to batches"
                  defaultChecked
                />
                <NotificationSetting
                  title="Enrollment Updates"
                  description="Receive updates on enrollment changes"
                  defaultChecked
                />
                <NotificationSetting
                  title="System Alerts"
                  description="Critical system and security alerts"
                  defaultChecked
                />
                <NotificationSetting
                  title="Daily Reports"
                  description="Receive daily summary reports"
                />
                <div className="modal-actions">
                  <Button type="submit">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "security" && (
          <section className="section">
            <div className="section-header">
              <h2>Security Settings</h2>
            </div>
            <div className="detail-section">
              <div className="detail-card">
                <SecuritySection
                  title="Password"
                  description="Last changed 30 days ago"
                  action="Change Password"
                />
                <SecuritySection
                  title="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                  action="Enable 2FA"
                />
                <SecuritySection
                  title="Active Sessions"
                  description="Manage your active login sessions"
                  action="View Sessions"
                />
                <SecuritySection
                  title="Login History"
                  description="View recent login activity"
                  action="View History"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "system" && (
          <section className="section">
            <div className="section-header">
              <h2>System Information</h2>
            </div>
            <div className="detail-section">
              <div className="detail-card">
                <SystemInfo label="Platform Version" value="1.0.0" />
                <SystemInfo label="Database Status" value="Connected" status="success" />
                <SystemInfo label="API Status" value="Operational" status="success" />
                <SystemInfo label="Last Backup" value="2024-01-15 02:00 UTC" />
                <SystemInfo label="Storage Usage" value="45.2 GB / 100 GB" />
                <SystemInfo label="Active Users" value="1,234" />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

interface NotificationSettingProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
}

function NotificationSetting({ title, description, defaultChecked = false }: NotificationSettingProps) {
  return (
    <div className="detail-row">
      <div className="detail-row-label">
        <div>
          <div className="detail-row-title">{title}</div>
          <div className="detail-row-description">{description}</div>
        </div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" defaultChecked={defaultChecked} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

interface SecuritySectionProps {
  title: string;
  description: string;
  action: string;
}

function SecuritySection({ title, description, action }: SecuritySectionProps) {
  return (
    <div className="detail-row">
      <div className="detail-row-label">
        <div>
          <div className="detail-row-title">{title}</div>
          <div className="detail-row-description">{description}</div>
        </div>
      </div>
      <Button variant="outline" size="sm">
        {action}
      </Button>
    </div>
  );
}

interface SystemInfoProps {
  label: string;
  value: string;
  status?: "success" | "warning" | "danger";
}

function SystemInfo({ label, value, status }: SystemInfoProps) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      <span className={`detail-row-value ${status ? `badge badge-${status}` : ""}`}>
        {value}
      </span>
    </div>
  );
}