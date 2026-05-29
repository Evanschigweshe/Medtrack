import { useMemo, useState } from 'react';

export default function Dashboard({ items, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === 'all' || category === item.category || (category === 'low' && item.quantity <= item.reorder_level);
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.barcode.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = items.filter((item) => item.quantity <= item.reorder_level).length;

  async function quickAdjust(item, delta) {
    await onUpdate(item.id, { quantity: Math.max(0, item.quantity + delta) });
  }

  return (
    <section>
      <div className="section-title">Overview — Inventory Status</div>
      <div className="stat-grid">
        <Stat label="Total SKUs" value={items.length} sub={`${totalUnits} units`} />
        <Stat label="Medicines" value={items.filter((i) => i.category === 'Medicine').length} />
        <Stat label="Vaccines" value={items.filter((i) => i.category === 'Vaccine').length} />
        <Stat label="Test Kits" value={items.filter((i) => i.category === 'Test Kit').length} />
        <Stat label="Low Stock" value={lowStock} danger />
      </div>

      <div className="filter-bar">
        {['all', 'Medicine', 'Vaccine', 'Test Kit', 'low'].map((value) => (
          <button key={value} onClick={() => setCategory(value)} className={category === value ? 'active' : ''}>{value}</button>
        ))}
        <input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table">
        <div className="row head"><div>Item</div><div>Category</div><div>Barcode</div><div>Qty</div><div>Expires</div><div>Actions</div></div>
        {filtered.map((item) => (
          <div className="row" key={item.id}>
            <div>{item.name}</div>
            <div><span className="pill">{item.category}</span></div>
            <div className="mono">{item.barcode}</div>
            <div className={item.quantity <= item.reorder_level ? 'danger' : 'good'}>{item.quantity}</div>
            <div className="mono">{item.expiry || '—'}</div>
            <div className="actions">
              <button onClick={() => quickAdjust(item, 1)}>+</button>
              <button onClick={() => quickAdjust(item, -1)}>−</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, sub, danger }) {
  return <div className={`stat-card ${danger ? 'danger-card' : ''}`}><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>;
}
