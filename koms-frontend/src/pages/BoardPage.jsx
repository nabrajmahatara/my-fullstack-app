import { useParams } from "react-router-dom";

export default function BoardPage() {
  const { id } = useParams();

  return (
    <div className="page-container">
      <h1>Board</h1>

      <p>
        Board ID: {id}
      </p>

      <p>
        Board page is ready. Lists will be added here.
      </p>
    </div>
  );
}