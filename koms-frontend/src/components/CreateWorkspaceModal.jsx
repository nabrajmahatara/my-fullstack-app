import { useState } from "react";
import { createWorkspace } from "../api/workspace.api";

export default function CreateWorkspaceModal({
  onClose,
  onCreated,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
      });

      onCreated(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create workspace"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Workspace</h2>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Workspace name</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter workspace name"
              required
            />
          </div>

          <div>
            <label>Description</label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter description"
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}