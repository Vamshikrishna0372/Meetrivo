const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'https://meetrivo.onrender.com';

// ── Core Fetch ─────────────────────────────────────────────────────────────

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('meetrivo_token') : null;
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('meetrivo_token');
    localStorage.removeItem('meetrivo_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.data ?? data) as T;
}

// ── Auth Helpers ────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login: email, password }),
    }),

  register: (data: { name: string; email: string; password: string; username?: string }) => {
    const username = data.username || data.email.split('@')[0] + "_" + Math.floor(Math.random() * 1000);
    return apiFetch<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email: data.email,
        fullName: data.name,
        password: data.password,
      }),
    });
  },

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    }),

  verifyEmail: (token: string) =>
    apiFetch<string>(`/api/auth/verify?token=${encodeURIComponent(token)}`),

  resendVerificationEmail: (email: string) =>
    apiFetch<string>('/api/auth/verify/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ message: string }>('/api/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () => {
    localStorage.removeItem('meetrivo_token');
    localStorage.removeItem('meetrivo_user');
  },

  getToken: () => localStorage.getItem('meetrivo_token'),
  getUser: () => {
    const raw = localStorage.getItem('meetrivo_user');
    return raw ? JSON.parse(raw) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('meetrivo_token'),

  saveSession: (token: string, user: any) => {
    localStorage.setItem('meetrivo_token', token);
    localStorage.setItem('meetrivo_user', JSON.stringify(user));
  },

  // OAuth2
  getOAuthUrl: (provider: 'google' | 'microsoft' | 'github') =>
    `${BACKEND_URL}/api/auth/oauth2/authorize/${provider}`,
  oauth2Login: (data: { provider: string; providerUserId: string; email: string; fullName: string; profilePicture?: string }) =>
    apiFetch<{ token: string; user: any }>('/api/auth/oauth2/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get current authenticated user from backend
  getCurrentUser: () => apiFetch<any>('/api/auth/me'),
};

// ── User / Profile ──────────────────────────────────────────────────────────

export const users = {
  getProfile: () => apiFetch<any>('/api/users/profile'),
  updateProfile: (data: any) =>
    apiFetch<any>('/api/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadProfilePicture: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<any>('/api/users/profile-picture', { method: 'POST', body: form });
  },
  getLoginHistory: () => apiFetch<any[]>('/api/users/login-history'),
  deactivateAccount: () =>
    apiFetch<any>('/api/users/deactivate', { method: 'POST' }),
  getUserStats: () => apiFetch<any>('/api/users/stats'),
};

// ── Dashboard ───────────────────────────────────────────────────────────────

export const dashboard = {
  // Full consolidated dashboard
  getFull: () => apiFetch<any>('/api/dashboard'),
  // Upcoming scheduled meetings
  getUpcomingMeetings: () => apiFetch<any[]>('/api/dashboard/upcoming-meetings'),
  // Recent past meetings
  getRecentMeetings: () => apiFetch<any[]>('/api/dashboard/recent-meetings'),
  // Dashboard notifications
  getNotifications: () => apiFetch<any[]>('/api/dashboard/notifications'),
};

// ── Meetings ────────────────────────────────────────────────────────────────

export const meetings = {
  // Get all meetings hosted by current user
  getAll: () => apiFetch<any[]>('/api/meetings/my'),
  getById: (id: string) => apiFetch<any>(`/api/meetings/${id}`),
  getParticipants: (id: string) => apiFetch<any[]>(`/api/meetings/${id}/participants`),
  getWaitingRoom: (id: string) => apiFetch<any[]>(`/api/meetings/${id}/waiting-room`),
  create: (data: any) =>
    apiFetch<any>('/api/meetings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/api/meetings/${id}`, { method: 'DELETE' }),
  join: (meetingCode: string, passcode?: string) =>
    apiFetch<any>(`/api/meetings/join`, { method: 'POST', body: JSON.stringify({ meetingIdentifier: meetingCode, password: passcode }) }),
  start: (id: string) =>
    apiFetch<any>(`/api/meetings/${id}/start`, { method: 'POST' }),
  // Upcoming meetings from dashboard endpoint
  getUpcoming: () => apiFetch<any[]>('/api/dashboard/upcoming-meetings'),

  // Recent meetings from dashboard endpoint
  getRecent: () => apiFetch<any[]>('/api/dashboard/recent-meetings'),
  lock: (id: string) =>
    apiFetch<any>(`/api/meetings/${id}/lock`, { method: 'POST' }),
  unlock: (id: string) =>
    apiFetch<any>(`/api/meetings/${id}/unlock`, { method: 'POST' }),
  endMeeting: (id: string) =>
    apiFetch<any>(`/api/meetings/${id}/end`, { method: 'POST' }),
  // Search meetings by meetingCode
  searchByCode: (meetingCode: string) =>
    apiFetch<any[]>(`/api/meetings/search?meetingCode=${encodeURIComponent(meetingCode)}`),
  // Approve participant from waiting room
  approveParticipant: (meetingId: string, userId: string) =>
    apiFetch<any>(`/api/meetings/${meetingId}/approve/${userId}`, { method: 'POST' }),
  // Reject participant from waiting room
  rejectParticipant: (meetingId: string, userId: string) =>
    apiFetch<any>(`/api/meetings/${meetingId}/reject/${userId}`, { method: 'POST' }),
  // Remove participant
  removeParticipant: (meetingId: string, userId: string) =>
    apiFetch<any>(`/api/meetings/${meetingId}/remove/${userId}`, { method: 'POST' }),
  // Ban participant
  banParticipant: (meetingId: string, userId: string) =>
    apiFetch<any>(`/api/meetings/${meetingId}/ban/${userId}`, { method: 'POST' }),
  // Assign role (CO_HOST, MODERATOR)
  assignRole: (meetingId: string, userId: string, role: string) =>
    apiFetch<any>(`/api/meetings/${meetingId}/assign-role/${userId}?role=${role}`, { method: 'POST' }),
  // Change meeting password
  changePassword: (meetingId: string, password: string) =>
    apiFetch<any>(`/api/meetings/${meetingId}/password`, { method: 'POST', body: JSON.stringify({ password }) }),
};

// ── Scheduling ──────────────────────────────────────────────────────────────

export const scheduling = {
  getAll: () => apiFetch<any[]>('/api/scheduling'),
  create: (data: any) =>
    apiFetch<any>('/api/scheduling', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/scheduling/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/api/scheduling/${id}`, { method: 'DELETE' }),
  getById: (id: string) => apiFetch<any>(`/api/scheduling/${id}`),
};

// ── Chat ─────────────────────────────────────────────────────────────────────

export const chat = {
  getMessages: (meetingId: string) => apiFetch<any[]>(`/api/chat/${meetingId}/messages`),
  sendMessage: (meetingId: string, content: string) =>
    apiFetch<any>(`/api/chat/${meetingId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteMessage: (meetingId: string, messageId: string) =>
    apiFetch<any>(`/api/chat/${meetingId}/messages/${messageId}`, { method: 'DELETE' }),
};

// ── Notifications ───────────────────────────────────────────────────────────

export const notifications = {
  getAll: () => apiFetch<any[]>('/api/notifications'),
  markRead: (id: string) =>
    apiFetch<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () =>
    apiFetch<any>('/api/notifications/read-all', { method: 'PUT' }),
  delete: (id: string) =>
    apiFetch<any>(`/api/notifications/${id}`, { method: 'DELETE' }),
  getUnreadCount: () =>
    apiFetch<number>('/api/notifications/unread-count'),
};

// ── Analytics ───────────────────────────────────────────────────────────────

export const analytics = {
  // User-level dashboard stats (accessible by all roles)
  getDashboard: () => apiFetch<any>('/api/users/stats'),
  getEngagement: () => apiFetch<any>('/api/admin/analytics/meetings'),
  getMeetingStats: (meetingId: string) => apiFetch<any>(`/api/admin/analytics/meetings`),
  getUsage: () => apiFetch<any>('/api/admin/analytics/system'),
  // Per-organization analytics
  getOrgAnalytics: (orgId: string) => apiFetch<any>(`/api/organizations/${orgId}/analytics`),
  // Admin-only full analytics
  getAdminDashboard: () => apiFetch<any>('/api/admin/analytics/users'),
};

// ── Organizations ────────────────────────────────────────────────────────────

export const organizations = {
  getMyOrganizations: () => apiFetch<any[]>('/api/organizations/my'),
  getById: (id: string) => apiFetch<any>(`/api/organizations/${id}`),
  create: (data: any) => apiFetch<any>('/api/organizations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch<any>(`/api/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/api/organizations/${id}`, { method: 'DELETE' }),
  getMembers: (id: string) => apiFetch<any[]>(`/api/organizations/${id}/members`),
  inviteMember: (id: string, email: string, role: string) =>
    apiFetch<any>(`/api/organizations/${id}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),
  removeMember: (id: string, userId: string) =>
    apiFetch<any>(`/api/organizations/${id}/members/${userId}`, { method: 'DELETE' }),
  getAnalytics: (id: string) => apiFetch<any>(`/api/organizations/${id}/analytics`),
  getTeams: (id: string) => apiFetch<any[]>(`/api/organizations/${id}/teams`),
  getDepartments: (id: string) => apiFetch<any[]>(`/api/organizations/${id}/departments`),
};

// ── Teams ─────────────────────────────────────────────────────────────────────

export const teams = {
  getAll: () => apiFetch<any[]>('/api/teams'),
  getById: (id: string) => apiFetch<any>(`/api/teams/${id}`),
  create: (data: any) =>
    apiFetch<any>('/api/teams', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/api/teams/${id}`, { method: 'DELETE' }),
  addMember: (teamId: string, userId: string) =>
    apiFetch<any>(`/api/teams/${teamId}/members/${userId}`, {
      method: 'POST',
    }),
  removeMember: (teamId: string, userId: string) =>
    apiFetch<any>(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' }),
  transferManager: (teamId: string, newManagerId: string) =>
    apiFetch<any>(`/api/teams/${teamId}/manager/${newManagerId}`, { method: 'PUT' }),
  getMembers: (teamId: string) =>
    apiFetch<any[]>(`/api/teams/${teamId}/members`),
};

// ── Departments ───────────────────────────────────────────────────────────────

export const departments = {
  getAll: () => apiFetch<any[]>('/api/departments'),
  getById: (id: string) => apiFetch<any>(`/api/departments/${id}`),
  create: (data: any) =>
    apiFetch<any>('/api/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/api/departments/${id}`, { method: 'DELETE' }),
  assignHead: (id: string, headId: string) =>
    apiFetch<any>(`/api/departments/${id}/head/${headId}`, { method: 'PUT' }),
  assignMembers: (id: string, memberIds: string[]) =>
    apiFetch<any>(`/api/departments/${id}/members`, { method: 'PUT', body: JSON.stringify(memberIds) }),
};

// ── Recording ─────────────────────────────────────────────────────────────────

export const recordings = {
  // My recordings
  getAll: () => apiFetch<any[]>('/api/recordings/my'),
  // Get recordings for a specific meeting
  getForMeeting: (meetingId: string) => apiFetch<any[]>(`/api/recordings/meeting/${meetingId}`),
  getById: (id: string) => apiFetch<any>(`/api/recordings/${id}`),
  // Backend uses POST /api/recordings/start with body
  start: (meetingId: string, recordingType?: string, permission?: string) =>
    apiFetch<any>(`/api/recordings/start`, {
      method: 'POST',
      body: JSON.stringify({
        meetingId,
        recordingType: recordingType || 'VIDEO_AUDIO',
        permission: permission || 'PARTICIPANTS',
      }),
    }),
  // Backend uses POST /api/recordings/stop?recordingId=...
  stop: (recordingId: string) =>
    apiFetch<any>(`/api/recordings/stop?recordingId=${encodeURIComponent(recordingId)}`, { method: 'POST' }),
  pause: (recordingId: string) =>
    apiFetch<any>(`/api/recordings/pause?recordingId=${encodeURIComponent(recordingId)}`, { method: 'POST' }),
  resume: (recordingId: string) =>
    apiFetch<any>(`/api/recordings/resume?recordingId=${encodeURIComponent(recordingId)}`, { method: 'POST' }),
  delete: (id: string) =>
    apiFetch<any>(`/api/recordings/${id}`, { method: 'DELETE' }),
  // Playback streaming URL
  getPlayUrl: (id: string) => `${BACKEND_URL}/api/recordings/play/${id}`,
  // Download URL with token
  download: (id: string) => `${BACKEND_URL}/api/recordings/download/${id}`,
};

// ── Files ─────────────────────────────────────────────────────────────────────

export const files = {
  upload: (file: File, meetingId?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (meetingId) form.append('meetingId', meetingId);
    return apiFetch<any>('/api/files/upload', { method: 'POST', body: form });
  },
  getAll: () => apiFetch<any[]>('/api/files'),
  delete: (id: string) => apiFetch<any>(`/api/files/${id}`, { method: 'DELETE' }),
  getDownloadUrl: (id: string) => `${BACKEND_URL}/api/files/download/${id}?token=${auth.getToken()}`,
};

// ── Search ────────────────────────────────────────────────────────────────────

export const search = {
  // Global search returns { meetings, users, organizations, teams, chats, recordings }
  global: (query: string) => apiFetch<any>(`/api/search?q=${encodeURIComponent(query)}`),
  // Convenience: extract meetings from global search
  meetings: async (query: string) => {
    const res = await apiFetch<any>(`/api/search?q=${encodeURIComponent(query)}`);
    return res?.meetings || [];
  },
  // Convenience: extract users from global search
  users: async (query: string) => {
    const res = await apiFetch<any>(`/api/search?q=${encodeURIComponent(query)}`);
    return res?.users || [];
  },
  organizations: async (query: string) => {
    const res = await apiFetch<any>(`/api/search?q=${encodeURIComponent(query)}`);
    return res?.organizations || [];
  },
  recordings: async (query: string) => {
    const res = await apiFetch<any>(`/api/search?q=${encodeURIComponent(query)}`);
    return res?.recordings || [];
  },
};

// ── Billing ───────────────────────────────────────────────────────────────────

export const billing = {
  getPlans: () => apiFetch<any[]>('/api/billing/plans'),
  getPlan: (planId: string) => apiFetch<any>(`/api/billing/plans/${planId}`),
  getSubscription: () => apiFetch<any>('/api/billing/subscription'),
  subscribe: (planId: string) =>
    apiFetch<any>('/api/billing/subscribe', { method: 'POST', body: JSON.stringify({ planId }) }),
  upgrade: (planId: string) =>
    apiFetch<any>('/api/billing/upgrade', { method: 'PUT', body: JSON.stringify({ planId }) }),
  downgrade: (planId: string) =>
    apiFetch<any>('/api/billing/downgrade', { method: 'PUT', body: JSON.stringify({ planId }) }),
  renew: () =>
    apiFetch<any>('/api/billing/renew', { method: 'POST' }),
  getInvoices: () => apiFetch<any[]>('/api/invoices'),
  getInvoice: (id: string) => apiFetch<any>(`/api/invoices/${id}`),
  downloadInvoiceUrl: (id: string) => `${BACKEND_URL}/api/invoices/download/${id}`,
  cancelSubscription: () =>
    apiFetch<any>('/api/billing/cancel', { method: 'DELETE' }),
};

// ── Feedback ───────────────────────────────────────────────────────────────────

export const feedback = {
  submit: (data: { meetingId?: string; rating: number; comment?: string }) =>
    apiFetch<any>('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiFetch<any[]>('/api/feedback'),
};

// ── Support ───────────────────────────────────────────────────────────────────

export const support = {
  createTicket: (data: { subject: string; description: string; priority?: string }) =>
    apiFetch<any>('/api/support', { method: 'POST', body: JSON.stringify(data) }),
  getTickets: () => apiFetch<any[]>('/api/support/my'),
  getAllTickets: () => apiFetch<any[]>('/api/support'),
  updateTicketStatus: (ticketId: string, status: string) =>
    apiFetch<any>(`/api/support/${ticketId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};


// ── Whiteboard ─────────────────────────────────────────────────────────────────

export const whiteboard = {
  save: (meetingId: string, data: any) =>
    apiFetch<any>(`/api/whiteboard/${meetingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (meetingId: string) => apiFetch<any>(`/api/whiteboard/${meetingId}`),
};

// ── Breakout Rooms ─────────────────────────────────────────────────────────────

export const breakoutRooms = {
  create: (meetingId: string, data: any) =>
    apiFetch<any>(`/api/breakout-rooms/${meetingId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: (meetingId: string) => apiFetch<any[]>(`/api/breakout-rooms/${meetingId}`),
  end: (roomId: string) =>
    apiFetch<any>(`/api/breakout-rooms/${roomId}/end`, { method: 'POST' }),
  assign: (meetingId: string, roomId: string, participantIds: string[]) =>
    apiFetch<any>(`/api/breakout-rooms/${meetingId}/${roomId}/assign`, { method: 'POST', body: JSON.stringify({ participantIds }) }),
  move: (meetingId: string, fromRoomId: string, toRoomId: string, participantId: string) =>
    apiFetch<any>(`/api/breakout-rooms/${meetingId}/move`, { method: 'POST', body: JSON.stringify({ fromRoomId, toRoomId, participantId }) }),
};

// ── AI Assistant ────────────────────────────────────────────────────────────────

export const ai = {
  ask: (question: string, meetingId?: string) =>
    apiFetch<any>('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, meetingId }),
    }),
  getSummary: (meetingId: string) => apiFetch<any>(`/api/meetings/${meetingId}/summary`),
  getTranscript: (meetingId: string) => apiFetch<any>(`/api/transcriptions/${meetingId}`),
};

// ── Attendance ────────────────────────────────────────────────────────────────

export const attendance = {
  getForMeeting: (meetingId: string) =>
    apiFetch<any[]>(`/api/attendance/meetings/${meetingId}`),
  getMyHistory: () => apiFetch<any[]>('/api/attendance/my'),
};

// ── Mobile ────────────────────────────────────────────────────────────────────

export const mobile = {
  registerDevice: (deviceToken: string, platform: string, deviceName?: string) =>
    apiFetch<any>('/api/mobile/register', {
      method: 'POST',
      body: JSON.stringify({ deviceToken, platform, deviceName }),
    }),
  removeDevice: (deviceToken: string) =>
    apiFetch<any>('/api/mobile/device', {
      method: 'DELETE',
      body: JSON.stringify({ deviceToken }),
    }),
};

// ── Templates ─────────────────────────────────────────────────────────────────

export const templates = {
  getAll: () => apiFetch<any[]>('/api/templates'),
  getById: (id: string) => apiFetch<any>(`/api/templates/${id}`),
  create: (data: any) =>
    apiFetch<any>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch<any>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<any>(`/api/templates/${id}`, { method: 'DELETE' }),
  createMeetingFromTemplate: (templateId: string) =>
    apiFetch<any>(`/api/templates/${templateId}/create-meeting`, { method: 'POST' }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const admin = {
  // Dashboard stats
  getStats: () => apiFetch<any>('/api/admin/dashboard/stats'),
  getActivity: () => apiFetch<any[]>('/api/admin/dashboard/activity'),
  // User management
  getUsers: () => apiFetch<any[]>('/api/admin/users'),
  getUserById: (userId: string) => apiFetch<any>(`/api/admin/users/${userId}`),
  updateUser: (userId: string, data: any) =>
    apiFetch<any>(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (userId: string) =>
    apiFetch<any>(`/api/admin/users/${userId}`, { method: 'DELETE' }),
  updateUserRole: (userId: string, role: string) =>
    apiFetch<any>(`/api/admin/users/${userId}/role?role=${role}`, { method: 'PUT' }),
  activateUser: (userId: string) =>
    apiFetch<any>(`/api/admin/users/${userId}/activate`, { method: 'PUT' }),
  deactivateUser: (userId: string) =>
    apiFetch<any>(`/api/admin/users/${userId}/deactivate`, { method: 'PUT' }),
  suspendUser: (userId: string) =>
    apiFetch<any>(`/api/admin/users/${userId}/suspend`, { method: 'PUT' }),
  blockUser: (userId: string) =>
    apiFetch<any>(`/api/admin/users/${userId}/block`, { method: 'PUT' }),
  unblockUser: (userId: string) =>
    apiFetch<any>(`/api/admin/users/${userId}/unblock`, { method: 'PUT' }),
  // Meeting management
  getMeetings: () => apiFetch<any[]>('/api/admin/meetings'),
  terminateMeeting: (meetingId: string) =>
    apiFetch<any>(`/api/admin/meetings/${meetingId}/terminate`, { method: 'POST' }),
  deleteMeeting: (meetingId: string) =>
    apiFetch<any>(`/api/admin/meetings/${meetingId}`, { method: 'DELETE' }),
  // Settings
  getSettings: () => apiFetch<any[]>('/api/admin/settings'),
  updateSetting: (setting: any) =>
    apiFetch<any>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(setting) }),
  // Analytics
  getAnalyticsUsers: () => apiFetch<any>('/api/admin/analytics/users'),
  getAnalyticsMeetings: () => apiFetch<any>('/api/admin/analytics/meetings'),
  getAnalyticsBilling: () => apiFetch<any>('/api/admin/analytics/billing'),
  getAnalyticsSystem: () => apiFetch<any>('/api/admin/analytics/system'),
  // Reports
  generateUserReport: () => apiFetch<any>('/api/admin/reports/users'),
  generateMeetingReport: () => apiFetch<any>('/api/admin/reports/meetings'),
  generateSystemReport: () => apiFetch<any>('/api/admin/reports/system'),
  exportCsvUrl: (id: string) => `${BACKEND_URL}/api/admin/reports/${id}/export/csv`,
  exportExcelUrl: (id: string) => `${BACKEND_URL}/api/admin/reports/${id}/export/excel`,
  exportPdfUrl: (id: string) => `${BACKEND_URL}/api/admin/reports/${id}/export/pdf`,
  // Audit logs
  getAuditLogs: () => apiFetch<any[]>('/api/audit/logs'),
  // System health
  getSystemHealth: () => apiFetch<any>('/api/system/health'),
  // Support tickets (admin view)
  getAllSupportTickets: () => apiFetch<any[]>('/api/support'),
  updateSupportTicketStatus: (ticketId: string, status: string) =>
    apiFetch<any>(`/api/support/${ticketId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  // Feedback (admin view)
  getAllFeedback: () => apiFetch<any[]>('/api/feedback'),
  // Announcements
  getAnnouncements: () => apiFetch<any[]>('/api/admin/announcements'),
  createAnnouncement: (data: any) =>
    apiFetch<any>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Audit ─────────────────────────────────────────────────────────────────────

export const audit = {
  getLogs: () => apiFetch<any[]>('/api/audit/logs'),
};

// ── Invitations ───────────────────────────────────────────────────────────────

export const invitations = {
  getAll: () => apiFetch<any[]>('/api/invitations'),
  accept: (invitationId: string) =>
    apiFetch<any>(`/api/invitations/${invitationId}/accept`, { method: 'POST' }),
  decline: (invitationId: string) =>
    apiFetch<any>(`/api/invitations/${invitationId}/decline`, { method: 'POST' }),
  send: (data: any) =>
    apiFetch<any>('/api/invitations', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Meeting Media (Screen Share, Recording via WebRTC) ──────────────────────

export const meetingMedia = {
  startScreenShare: (meetingId: string) =>
    apiFetch<any>(`/api/meeting-media/${meetingId}/screenshare/start`, { method: 'POST' }),
  stopScreenShare: (meetingId: string) =>
    apiFetch<any>(`/api/meeting-media/${meetingId}/screenshare/stop`, { method: 'POST' }),
  getMediaState: (meetingId: string) =>
    apiFetch<any>(`/api/meeting-media/${meetingId}/state`),
};

// ── Health ─────────────────────────────────────────────────────────────────────

export const health = {
  check: () => apiFetch<any>('/api/health'),
};

export const BACKEND_BASE_URL = BACKEND_URL;
