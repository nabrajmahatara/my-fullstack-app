import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>KOMS</h1>
          <p>Kitchen Operating Management System</p>
        </div>

        <div className="user-section">
          <span>
            Welcome, {user?.name || user?.username || "User"}
          </span>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>Kitchen Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Today's Orders</h3>
            <p>24</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>8</p>
          </div>

          <div className="stat-card">
            <h3>Preparing</h3>
            <p>10</p>
          </div>

          <div className="stat-card">
            <h3>Ready</h3>
            <p>4</p>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <p>2</p>
          </div>
        </div>

        <section className="orders-section">
          <h2>Recent Kitchen Orders</h2>

          <div className="orders-table">
            <div className="order-row order-header">
              <span>Order</span>
              <span>Item</span>
              <span>Table</span>
              <span>Status</span>
            </div>

            <div className="order-row">
              <span>#101</span>
              <span>Chicken Momo × 2</span>
              <span>Table 5</span>
              <span className="status pending">Pending</span>
            </div>

            <div className="order-row">
              <span>#102</span>
              <span>Veg Chowmein × 1</span>
              <span>Table 2</span>
              <span className="status preparing">Preparing</span>
            </div>

            <div className="order-row">
              <span>#103</span>
              <span>Chicken Fried Rice × 2</span>
              <span>Table 7</span>
              <span className="status ready">Ready</span>
            </div>

            <div className="order-row">
              <span>#104</span>
              <span>Paneer Curry × 1</span>
              <span>Table 3</span>
              <span className="status completed">Completed</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;