import api from "./axios";

// Get all workspaces for current user
export const getWorkspaces = async () => {
  const response = await api.get("/workspaces");
  return response.data;
};

// Get one workspace
export const getWorkspace = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data;
};

// Create workspace
export const createWorkspace = async (data) => {
  const response = await api.post("/workspaces", data);
  return response.data;
};

// Update workspace
export const updateWorkspace = async (workspaceId, data) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}`,
    data
  );

  return response.data;
};

// Delete workspace
export const deleteWorkspace = async (workspaceId) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}`
  );

  return response.data;
};

// Invite/add member
export const addMember = async (workspaceId, identifier) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/members`,
    {
      identifier,
    }
  );

  return response.data;
};

// Change member role
export const updateMemberRole = async (
  workspaceId,
  memberId,
  role
) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}/members/${memberId}`,
    {
      role,
    }
  );

  return response.data;
};

// Remove member
export const removeMember = async (
  workspaceId,
  memberId
) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/members/${memberId}`
  );

  return response.data;
};

// Leave workspace
export const leaveWorkspace = async (workspaceId) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/leave`
  );

  return response.data;
};