import { api } from "./api";

export type AuditLogQuery = {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityName?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
};

export const auditLogApi = {
  list: (params?: AuditLogQuery) => api.get("/audit-logs", { params }),
  getOne: (id: string) => api.get(`/audit-logs/${id}`),
};
