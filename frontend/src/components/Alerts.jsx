export default function Alerts({ alerts }) {
  return (
    <section>
      <div className="section-title">Alert History</div>
      {alerts.length === 0 ? (
        <div className="panel">No alerts yet.</div>
      ) : (
        alerts.map((alert) => (
          <div className="alert-card" key={alert.id}>
            <strong>Low Stock Alert</strong>
            <p>{alert.message}</p>
            <small>{new Date(alert.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </section>
  );
}
