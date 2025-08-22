import React from "react";
import "./App.css";

type Item = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

const STORAGE_KEY = "shopping-list-v1";
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random()}`;
}

export default function App() {
  const [items, setItems] = React.useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Item[]) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const [name, setName] = React.useState("");
  const [qty, setQty] = React.useState<number>(1);
  const [price, setPrice] = React.useState<number>(0);

  function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const q = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const p = Number.isFinite(price) && price >= 0 ? price : 0;
    const item: Item = { id: uid(), name: n, qty: q, price: p };
    setItems(prev => [item, ...prev]);
    setName(""); setQty(1); setPrice(0);
  }

  function inc(id: string) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it));
  }

  function dec(id: string) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  function clearAll() {
    if (confirm("¿Vaciar la lista?")) setItems([]);
  }

  const total = items.reduce((acc, it) => acc + it.qty * it.price, 0);

  return (
    <main className="app-container">
      <h1>Lista de compras</h1>

      {/* Formulario */}
      <form className="shop-form" onSubmit={addItem}>
        <input
          className="shop-input"
          placeholder="Producto (ej: Leche)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nombre del producto"
        />
        <input
          className="shop-input"
          type="number"
          min={1}
          step={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || "1", 10))}
          onFocus={(e) => (e.target as HTMLInputElement).select()}
          aria-label="Cantidad"
          placeholder="Cant."
        />
        <input
          className="shop-input"
          type="number"
          min={0}
          step="0.01"
          value={Number.isNaN(price) ? 0 : price}
          onChange={(e) => setPrice(parseFloat(e.target.value || "0"))}
          onFocus={(e) => (e.target as HTMLInputElement).select()}
          aria-label="Precio unitario"
          placeholder="Precio"
        />
        <button type="submit">Agregar</button>
      </form>

      {/* Tabla sencilla */}
      <div className="shop-table">
        <div className="shop-row shop-head">
          <div>Producto</div>
          <div>Cant.</div>
          <div>Precio</div>
          <div>Subtotal</div>
          <div></div>
        </div>

        {items.map((it) => (
          <div className="shop-row" key={it.id}>
            <div className="shop-name">{it.name}</div>
            <div className="shop-qty">
              <button type="button" className="pill" onClick={() => dec(it.id)} aria-label="Restar">–</button>
              <span className="qty">{it.qty}</span>
              <button type="button" className="pill" onClick={() => inc(it.id)} aria-label="Sumar">+</button>
            </div>
            <div className="shop-price">{money.format(it.price)}</div>
            <div className="shop-subtotal">{money.format(it.qty * it.price)}</div>
            <div>
              <button className="shop-remove" type="button" onClick={() => removeItem(it.id)}>Eliminar</button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="shop-empty">Tu lista está vacía. Agregá productos arriba.</div>
        )}
      </div>

      {/* Barra inferior */}
      <div className="shop-footer">
        <div className="shop-total">
          Total: <strong>{money.format(total)}</strong>
        </div>
        <button type="button" className="outline" onClick={clearAll}>Vaciar lista</button>
      </div>
    </main>
  );
}
