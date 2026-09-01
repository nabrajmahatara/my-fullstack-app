import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <h1>Checking API Health...</h1>
      <p>Open your browser console (F12) to see the result.</p>
    </>
  );
}
