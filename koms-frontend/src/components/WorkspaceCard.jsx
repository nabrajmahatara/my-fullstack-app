export default function WorkspaceCard({
  workspace,
  onClick,
}) {
  return (
    <div
      className="workspace-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onClick();
        }
      }}
    >
      <h2>{workspace.name}</h2>

      <p>
        {workspace.description ||
          "No description"}
      </p>

      <div className="workspace-card-footer">
        <span>
          Members:{" "}
          {workspace.members?.length || 0}
        </span>

        <span>
          Boards:{" "}
          {workspace.boards?.length || 0}
        </span>
      </div>
    </div>
  );
}