import { useParams } from "react-router-dom";

export default function WorkspaceDetailPage() {
  const { id } = useParams();

  return (
    <div className="page-container">
      <h1>Workspace</h1>

      <p>Workspace ID: {id}</p>

      <p>
        Workspace detail page is ready.
      </p>
    </div>
  );
}