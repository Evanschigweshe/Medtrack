import { useMemo, useState } from 'react';

export default function Scanner({ items, activity, onAddItem, onStockAction }) {
  const [action, setAction] = useState('in');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    name: '',
    category: 'Medicine',
    barcode: '',
    quantity: 10,
    expiry: '',
    reorder_level: 5,
  });

  const scannedItem = useMemo(
    () => items.find((item) => item.barcode.toLowerCase() === barcode.toLowerCase()),
    [items, barcode]
  );

  async function submitStockAction(event) {
    event.preventDefault();
    await onStockAction(action, { barcode, quantity: Number(quantity) });
    setBarcode('');
    setQuantity(1);
  }

  async function submitNewItem(event) {
    event.preventDefault();
    await onAddItem({ ...form, quantity: Number(form.quantity), reorder_level: Number(form.reorder_level) });
    setForm({ name: '', category: 'Medicine', barcode: '', quantity: 10, expiry: '', reorder_level: 5 });
  }

  return (
    <section className="scanner-layout">
      <div className="panel">
        <h2>Barcode Scanner</h2>
        <div className="toggle">
          <button className={action === 'in' ? 'active' : ''} onClick={() => setAction('in')}>Check In</button>
          <button className={action === 'out' ? 'active' : ''} onClick={() => setAction('out')}>Check Out</button>
        </div>

        <form onSubmit={submitStockAction}>
          <label>Barcode / SKU</label>
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan or type barcode" required />

          {barcode && (
            <div className="result">
              {scannedItem ? `${scannedItem.name} — ${scannedItem.quantity} in stock` : 'No item found. Register it below.'}
            </div>
          )}

          <label>Quantity</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <button className="primary" type="submit">{action === 'in' ? 'Add to Inventory' : 'Remove from Inventory'}</button>
        </form>
      </div>

      <div className="panel">
        <h2>Register New Item</h2>
        <form onSubmit={submitNewItem}>
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Medicine</option>
            <option>Vaccine</option>
            <option>Test Kit</option>
            <option>Supply</option>
          </select>
          <label>Barcode</label>
          <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} required />
          <label>Initial Quantity</label>
          <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <label>Expiry</label>
          <input value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} placeholder="MM/YYYY" />
          <label>Reorder Level</label>
          <input type="number" min="1" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
          <button className="primary" type="submit">Add Item</button>
        </form>
      </div>

      <div className="panel activity">
        <h2>Activity Log</h2>
        {activity.length === 0 ? <p>No activity yet.</p> : activity.map((entry) => (
          <div key={entry.id} className="activity-item">
            <strong>{entry.action}</strong> {entry.item_name} ({entry.quantity}) → {entry.new_quantity}
          </div>
        ))}
      </div>
    </section>
  );
}
