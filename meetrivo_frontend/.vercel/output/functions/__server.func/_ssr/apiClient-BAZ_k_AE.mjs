const BACKEND_URL = "http://localhost:8081";
async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("meetrivo_token") : null;
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers
  });
  if (response.status === 401) {
    localStorage.removeItem("meetrivo_token");
    localStorage.removeItem("meetrivo_user");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  const data = await response.json();
  return data.data ?? data;
}
const auth = {
  login: (email, password) => apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login: email, password })
  }),
  register: (data) => {
    const username = data.username || data.email.split("@")[0] + "_" + Math.floor(Math.random() * 1e3);
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        email: data.email,
        fullName: data.name,
        password: data.password
      })
    });
  },
  forgotPassword: (email) => apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  resetPassword: (token, newPassword) => apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password: newPassword })
  }),
  verifyEmail: (token) => apiFetch(`/api/auth/verify?token=${encodeURIComponent(token)}`),
  resendVerificationEmail: (email) => apiFetch("/api/auth/verify/resend", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  changePassword: (currentPassword, newPassword) => apiFetch("/api/users/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword })
  }),
  logout: () => {
    localStorage.removeItem("meetrivo_token");
    localStorage.removeItem("meetrivo_user");
  },
  getToken: () => localStorage.getItem("meetrivo_token"),
  getUser: () => {
    const raw = localStorage.getItem("meetrivo_user");
    return raw ? JSON.parse(raw) : null;
  },
  isAuthenticated: () => !!localStorage.getItem("meetrivo_token"),
  saveSession: (token, user) => {
    localStorage.setItem("meetrivo_token", token);
    localStorage.setItem("meetrivo_user", JSON.stringify(user));
  }
};
const users = {
  getProfile: () => apiFetch("/api/users/profile"),
  updateProfile: (data) => apiFetch("/api/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  uploadProfilePicture: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/api/users/profile-picture", { method: "POST", body: form });
  },
  getLoginHistory: () => apiFetch("/api/users/login-history"),
  deactivateAccount: () => apiFetch("/api/users/deactivate", { method: "POST" })
};
const meetings = {
  getAll: () => apiFetch("/api/meetings"),
  getById: (id) => apiFetch(`/api/meetings/${id}`),
  create: (data) => apiFetch("/api/meetings", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/api/meetings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/api/meetings/${id}`, { method: "DELETE" }),
  join: (meetingCode, passcode) => apiFetch(`/api/meetings/join`, { method: "POST", body: JSON.stringify({ meetingIdentifier: meetingCode, password: passcode }) }),
  getUpcoming: () => apiFetch("/api/meetings/upcoming"),
  getRecent: () => apiFetch("/api/meetings/recent"),
  lock: (id) => apiFetch(`/api/meetings/${id}/lock`, { method: "POST" }),
  unlock: (id) => apiFetch(`/api/meetings/${id}/unlock`, { method: "POST" }),
  endMeeting: (id) => apiFetch(`/api/meetings/${id}/end`, { method: "POST" }),
  searchByCode: (meetingCode) => apiFetch(`/api/meetings/search?meetingCode=${encodeURIComponent(meetingCode)}`)
};
const notifications = {
  getAll: () => apiFetch("/api/notifications"),
  markRead: (id) => apiFetch(`/api/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => apiFetch("/api/notifications/read-all", { method: "PUT" })
};
const analytics = {
  getDashboard: () => apiFetch("/api/analytics/dashboard"),
  getEngagement: () => apiFetch("/api/analytics/engagement"),
  getMeetingStats: (meetingId) => apiFetch(`/api/analytics/meetings/${meetingId}`),
  getUsage: () => apiFetch("/api/analytics/usage")
};
const organizations = {
  getMyOrganizations: () => apiFetch("/api/organizations/my"),
  getById: (id) => apiFetch(`/api/organizations/${id}`),
  create: (data) => apiFetch("/api/organizations", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/api/organizations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getMembers: (id) => apiFetch(`/api/organizations/${id}/members`),
  inviteMember: (id, email, role) => apiFetch(`/api/organizations/${id}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email, role })
  }),
  removeMember: (id, userId) => apiFetch(`/api/organizations/${id}/members/${userId}`, { method: "DELETE" }),
  getAnalytics: (id) => apiFetch(`/api/organizations/${id}/analytics`),
  getTeams: (id) => apiFetch(`/api/organizations/${id}/teams`),
  getDepartments: (id) => apiFetch(`/api/organizations/${id}/departments`)
};
const teams = {
  getAll: () => apiFetch("/api/teams"),
  getById: (id) => apiFetch(`/api/teams/${id}`),
  create: (data) => apiFetch("/api/teams", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/api/teams/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/api/teams/${id}`, { method: "DELETE" }),
  addMember: (teamId, userId) => apiFetch(`/api/teams/${teamId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId })
  }),
  removeMember: (teamId, userId) => apiFetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" })
};
const departments = {
  getAll: () => apiFetch("/api/departments"),
  getById: (id) => apiFetch(`/api/departments/${id}`),
  create: (data) => apiFetch("/api/departments", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/api/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/api/departments/${id}`, { method: "DELETE" })
};
const files = {
  upload: (file, meetingId) => {
    const form = new FormData();
    form.append("file", file);
    if (meetingId) form.append("meetingId", meetingId);
    return apiFetch("/api/files/upload", { method: "POST", body: form });
  },
  getAll: () => apiFetch("/api/files"),
  delete: (id) => apiFetch(`/api/files/${id}`, { method: "DELETE" }),
  getDownloadUrl: (id) => `${BACKEND_URL}/api/files/download/${id}?token=${auth.getToken()}`
};
const billing = {
  getPlans: () => apiFetch("/api/billing/plans"),
  getSubscription: () => apiFetch("/api/billing/subscription"),
  subscribe: (planId) => apiFetch("/api/billing/subscribe", { method: "POST", body: JSON.stringify({ planId }) }),
  getInvoices: () => apiFetch("/api/invoices"),
  cancelSubscription: () => apiFetch("/api/billing/cancel", { method: "DELETE" })
};
const feedback = {
  submit: (data) => apiFetch("/api/feedback", { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiFetch("/api/feedback")
};
const support = {
  createTicket: (data) => apiFetch("/api/support", { method: "POST", body: JSON.stringify(data) }),
  getTickets: () => apiFetch("/api/support/my"),
  getAllTickets: () => apiFetch("/api/support"),
  updateTicketStatus: (ticketId, status) => apiFetch(`/api/support/${ticketId}/status`, { method: "PUT", body: JSON.stringify({ status }) })
};
const whiteboard = {
  save: (meetingId, data) => apiFetch(`/api/whiteboard/${meetingId}`, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  get: (meetingId) => apiFetch(`/api/whiteboard/${meetingId}`)
};
const breakoutRooms = {
  create: (meetingId, data) => apiFetch(`/api/breakout-rooms/${meetingId}`, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  getAll: (meetingId) => apiFetch(`/api/breakout-rooms/${meetingId}`),
  end: (roomId) => apiFetch(`/api/breakout-rooms/${roomId}/end`, { method: "POST" }),
  assign: (meetingId, roomId, participantIds) => apiFetch(`/api/breakout-rooms/${meetingId}/${roomId}/assign`, { method: "POST", body: JSON.stringify({ participantIds }) }),
  move: (meetingId, fromRoomId, toRoomId, participantId) => apiFetch(`/api/breakout-rooms/${meetingId}/move`, { method: "POST", body: JSON.stringify({ fromRoomId, toRoomId, participantId }) })
};
const ai = {
  ask: (question, meetingId) => apiFetch("/api/ai/ask", {
    method: "POST",
    body: JSON.stringify({ question, meetingId })
  }),
  getSummary: (meetingId) => apiFetch(`/api/meetings/${meetingId}/summary`),
  getTranscript: (meetingId) => apiFetch(`/api/transcriptions/${meetingId}`)
};
const admin = {
  getStats: () => apiFetch("/api/admin/dashboard/stats"),
  getActivity: () => apiFetch("/api/admin/dashboard/activity"),
  getUsers: () => apiFetch("/api/admin/users"),
  updateUser: (userId, data) => apiFetch(`/api/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (userId) => apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" }),
  updateUserRole: (userId, role) => apiFetch(`/api/admin/users/${userId}/role?role=${role}`, { method: "PUT" }),
  activateUser: (userId) => apiFetch(`/api/admin/users/${userId}/activate`, { method: "PUT" }),
  deactivateUser: (userId) => apiFetch(`/api/admin/users/${userId}/deactivate`, { method: "PUT" }),
  suspendUser: (userId) => apiFetch(`/api/admin/users/${userId}/suspend`, { method: "PUT" }),
  blockUser: (userId) => apiFetch(`/api/admin/users/${userId}/block`, { method: "PUT" }),
  unblockUser: (userId) => apiFetch(`/api/admin/users/${userId}/unblock`, { method: "PUT" }),
  getMeetings: () => apiFetch("/api/admin/meetings"),
  terminateMeeting: (meetingId) => apiFetch(`/api/admin/meetings/${meetingId}/terminate`, { method: "POST" }),
  deleteMeeting: (meetingId) => apiFetch(`/api/admin/meetings/${meetingId}`, { method: "DELETE" }),
  getSettings: () => apiFetch("/api/admin/settings"),
  updateSetting: (setting) => apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(setting) }),
  getAnalyticsUsers: () => apiFetch("/api/admin/analytics/users"),
  getAnalyticsMeetings: () => apiFetch("/api/admin/analytics/meetings"),
  getAnalyticsBilling: () => apiFetch("/api/admin/analytics/billing"),
  getAnalyticsSystem: () => apiFetch("/api/admin/analytics/system"),
  generateUserReport: () => apiFetch("/api/admin/reports/users"),
  generateMeetingReport: () => apiFetch("/api/admin/reports/meetings"),
  generateSystemReport: () => apiFetch("/api/admin/reports/system"),
  exportCsvUrl: (id) => `${BACKEND_URL}/api/admin/reports/${id}/export/csv`,
  exportExcelUrl: (id) => `${BACKEND_URL}/api/admin/reports/${id}/export/excel`,
  exportPdfUrl: (id) => `${BACKEND_URL}/api/admin/reports/${id}/export/pdf`
};
export {
  admin,
  ai,
  analytics,
  apiFetch,
  auth,
  billing,
  breakoutRooms,
  departments,
  feedback,
  files,
  meetings,
  notifications,
  organizations,
  support,
  teams,
  users,
  whiteboard
};
