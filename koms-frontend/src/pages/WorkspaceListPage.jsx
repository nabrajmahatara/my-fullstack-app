import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getWorkspaces } from "../api/workspace.api";
import WorkspaceCard from "../components/WorkspaceCard";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";

export default function WorkspaceListPage() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWorkspaces();

      setWorkspaces(response.data || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load workspaces"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleWorkspaceCreated = (workspace) => {
    setWorkspaces((previous) => [
      workspace,
      ...previous,
    ]);

    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Workspaces</h1>
        <p>Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Workspaces</h1>
          <p>Select a workspace to continue.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
        >
          + Create Workspace
        </button>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {workspaces.length === 0 ? (
        <div className="empty-state">
          <h2>No workspaces yet</h2>
          <p>
            Create your first workspace to get started.
          </p>

          <button
            onClick={() => setShowCreateModal(true)}
          >
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="workspace-grid">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace._id || workspace.id}
              workspace={workspace}
              onClick={() =>
                navigate(
                  `/workspaces/${
                    workspace._id || workspace.id
                  }`
                )
              }
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleWorkspaceCreated}
        />
      )}
    </div>
  );
}