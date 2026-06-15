import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import Dashboard from './components/Dashboard.jsx';
import Scanner from './components/Scanner.jsx';
import Alerts from './components/Alerts.jsx';
import Login from './components/Login.jsx';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [activity, setActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState('');

  const [facility, setFacility] = useState(() => {
    const saved = localStorage.getItem('facility');
    return saved ? JSON.parse(saved) : null;
  });

  async function refreshAll() {
    const [itemsRes, activityRes, alertsRes] = await Promise.all([
      api.get('/items'),
      api.get('/inventory/activity'),
      api.get('/alerts'),
    ]);

    setItems(itemsRes.data);
    setActivity(activityRes.data);
    setAlerts(alertsRes.data);
  }

  useEffect(() => {
    if (facility) {
      refreshAll().catch(() => setMessage('Could not connect to backend API.'));
    }
  }, [facility]);

  const lowStockCount = useMemo(
    () => items.filter((item) => item.quantity <= item.reorder_level).length,
    [items]
  );

  async function addItem(payload) {
    await api.post('/items', payload);
    setMessage('Item added.');
    await refreshAll();
  }

  async function updateItem(id, payload) {
    await api.put(`/items/${id}`, payload);
    setMessage('Item updated.');
    await refreshAll();
  }

  async function deleteItem(id) {
    await api.delete(`/items/${id}`);
    setMessage('Item deleted.');
    await refreshAll();
  }

  async function stockAction(type, payload) {
    const endpoint = type === 'in' ? '/inventory/check-in' : '/inventory/check-out';
    await api.post(endpoint, payload);
    setMessage(type === 'in' ? 'Stock added.' : 'Stock removed.');
    await refreshAll();
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('facility');
    setFacility(null);
    setItems([]);
    setActivity([]);
    setAlerts([]);
    setMessage('');
  }

  if (!facility) {
    return <Login onLogin={setFacility} />;
  }

  return (
    <>
      <header>
        <div className="logo">
          <span className="logo-dot" /> MedTrack
        </div>

        <nav className="nav-tabs">
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </button>

          <button
            className={view === 'scanner' ? 'active' : ''}
            onClick={() => setView('scanner')}
          >
            Scanner
          </button>

          <button
            className={view === 'alerts' ? 'active' : ''}
            onClick={() => setView('alerts')}
          >
            Alerts {lowStockCount > 0 && <b>{lowStockCount}</b>}
          </button>

          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <main>
        <div className="notice">
          Facility: {facility.name}
        </div>

        {message && <div className="notice">{message}</div>}

        {view === 'dashboard' && (
          <Dashboard items={items} onUpdate={updateItem} onDelete={deleteItem} />
        )}

        {view === 'scanner' && (
          <Scanner
            items={items}
            activity={activity}
            onAddItem={addItem}
            onStockAction={stockAction}
          />
        )}

        {view === 'alerts' && <Alerts alerts={alerts} />}
      </main>
    </>
  );
}