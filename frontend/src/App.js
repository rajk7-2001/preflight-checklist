import React, { useState, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

const DEFAULT_CHECKS = [
  "Check Digital Sky for airspace clearance",
  "WINDY DATA- at 0m alt, at 100m alt",
  "Anemometer wind speed & Wind Direction",
  "Inform the GC to power up the aircraft",
  "Choose the respective mission",
  "Write and read the mission",
  "Reconfirm UAV heading and WP heading",
  "Check WP numbering & altitudes"
];

export default function App() {
  const [form, setForm] = useState({
    flight_number: "",
    filed_by: "",
    filing_time: "",
    departure_location: "",
    departure_time: "",
    arrival_location: "",
    est_arrival_time: ""
  });

  const [composeItems, setComposeItems] = useState(
    DEFAULT_CHECKS.map((c) => ({ checks: c, status: "pending", comments: "" }))
  );

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mergedItems, setMergedItems] = useState([]);

  useEffect(() => {
    fetchAllPreflights();
  }, []);

  async function fetchAllPreflights() {
    const res = await fetch(`${API_BASE}/preflights/`);
    const data = await res.json();
    setResults(data);
  }

  async function createPreflight() {
    if (!form.flight_number.trim()) {
      alert("Flight Number is required");
      return;
    }

    const res = await fetch(`${API_BASE}/preflights/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      alert("Error creating preflight");
      return;
    }

    for (let it of composeItems) {
      await fetch(`${API_BASE}/preflights/${form.flight_number}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(it)
      });
    }

    alert("Preflight Created");
    setForm({
      flight_number: "",
      filed_by: "",
      filing_time: "",
      departure_location: "",
      departure_time: "",
      arrival_location: "",
      est_arrival_time: ""
    });

    setComposeItems(DEFAULT_CHECKS.map(c => ({
      checks: c, status: "pending", comments: ""
    })));

    fetchAllPreflights();
  }

  async function selectPreflight(p) {
    const res = await fetch(`${API_BASE}/preflights/${p.flight_number}/`);
    const data = await res.json();

    setSelected(data);

    setForm({
      flight_number: data.flight_number,
      filed_by: data.filed_by || "",
      filing_time: data.filing_time || "",
      departure_location: data.departure_location || "",
      departure_time: data.departure_time || "",
      arrival_location: data.arrival_location || "",
      est_arrival_time: data.est_arrival_time || ""
    });

    const merged = DEFAULT_CHECKS.map((defaultText) => {
      const match = data.items.find(i => i.checks === defaultText);
      return match
        ? { ...match, deleted: false }
        : { checks: defaultText, status: "pending", comments: "", deleted: false };
    });

    setMergedItems(merged);
  }

    async function saveSelectedChanges() {
    const head = {
      flight_number: selected.flight_number,
      filed_by: form.filed_by,
      filing_time: form.filing_time,
      departure_location: form.departure_location,
      departure_time: form.departure_time,
      arrival_location: form.arrival_location,
      est_arrival_time: form.est_arrival_time
    };

    await fetch(`${API_BASE}/preflights/${selected.flight_number}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(head)
    });

    for (let row of mergedItems) {
      if (row.deleted && row.id) {
        await fetch(`${API_BASE}/items/${row.id}/`, { method: "DELETE" });
        continue;
      }

      if (row.id) {
        await fetch(`${API_BASE}/items/${row.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row)
        });
      } else {
        await fetch(`${API_BASE}/preflights/${selected.flight_number}/items/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row)
        });
      }
    }

    alert("Changes Saved");
    selectPreflight({ flight_number: selected.flight_number });
    fetchAllPreflights();
  }

  async function deletePreflight(fno) {
    if (!window.confirm("Delete Preflight?")) return;

    await fetch(`${API_BASE}/preflights/${fno}/`, { method: "DELETE" });
    setSelected(null);
    fetchAllPreflights();
  }

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "auto", fontFamily: "Arial" }}>

      {/* EXISTING PREFLIGHTS LIST AT TOP */}
      <div style={{ marginBottom: 25 }}>
        <h2>Existing Preflight Checklists</h2>
        <ul>
          {results.length === 0 && <li>No preflights available</li>}
          {results.map((r) => (
            <li key={r.flight_number} style={{ marginBottom: 6 }}>
              <button
                onClick={() => selectPreflight(r)}
                style={{ padding: "6px 12px" }}
              >
                {r.flight_number}
              </button>

              <button
                onClick={() => deletePreflight(r.flight_number)}
                style={{ marginLeft: 10, color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <h1>Preflight Checklist</h1>

      {/* SECTION 1 — PREFLIGHT HEADER */}
      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8, marginBottom: 25 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
          
          <div>
            <label>Flight Number</label>
            <input
              value={form.flight_number}
              readOnly={!!selected}
              onChange={e => setForm({ ...form, flight_number: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label>Filed By</label>
            <input
              value={form.filed_by}
              onChange={e => setForm({ ...form, filed_by: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label>Filing Time</label>
            <input
              value={form.filing_time}
              onChange={e => setForm({ ...form, filing_time: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label>Departure Location</label>
            <input
              value={form.departure_location}
              onChange={e => setForm({ ...form, departure_location: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label>Departure Time</label>
            <input
              value={form.departure_time}
              onChange={e => setForm({ ...form, departure_time: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label>Est. Arrival Time</label>
            <input
              value={form.est_arrival_time}
              onChange={e => setForm({ ...form, est_arrival_time: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

          <div>
            <label>Arrival Location</label>
            <input
              value={form.arrival_location}
              onChange={e => setForm({ ...form, arrival_location: e.target.value })}
              style={{ width: "100%", padding: 10 }}
            />
          </div>

        </div>
      </div>

      {/* SECTION 2 — CHECKLIST CREATE MODE */}
      {!selected && (
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <h3>Checklist (Default Items)</h3>

          <table style={{ width: "100%", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                <th style={{ padding: 12 }}>Checks</th>
                <th style={{ padding: 12, width: 150 }}>Status</th>
                <th style={{ padding: 12 }}>Comments</th>
              </tr>
            </thead>

            <tbody>
              {composeItems.map((it, idx) => (
                <tr key={idx} style={{
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                }}>
                  <td style={{ padding: 14 }}>{it.checks}</td>

                  <td style={{ padding: 14 }}>
                    <select
                      value={it.status}
                      onChange={e => {
                        const copy = [...composeItems];
                        copy[idx].status = e.target.value;
                        setComposeItems(copy);
                      }}
                      style={{ width: "100%", padding: 8 }}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  <td style={{ padding: 14 }}>
                    <input
                      value={it.comments}
                      onChange={e => {
                        const copy = [...composeItems];
                        copy[idx].comments = e.target.value;
                        setComposeItems(copy);
                      }}
                      style={{ width: "100%", padding: 10 }}
                      placeholder="Enter comments..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={createPreflight} style={{ marginTop: 20, padding: "10px 16px" }}>
            Create Preflight Checklist
          </button>
        </div>
      )}

      {/* SECTION 2 — CHECKLIST EDIT MODE */}
      {selected && (
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <h3>Checklist (Edit)</h3>

          <table style={{ width: "100%", borderSpacing: "0 12px" }}>
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                <th style={{ padding: 12 }}>Checks</th>
                <th style={{ padding: 12, width: 150 }}>Status</th>
                <th style={{ padding: 12 }}>Comments</th>
                <th style={{ padding: 12, width: 100 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {mergedItems.map((row, idx) => {
                if (row.deleted) return null;

                return (
                  <tr key={idx} style={{
                    background: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                  }}>
                    <td style={{ padding: 14 }}>{row.checks}</td>

                    <td style={{ padding: 14 }}>
                      <select
                        value={row.status}
                        onChange={e => {
                          const copy = [...mergedItems];
                          copy[idx].status = e.target.value;
                          setMergedItems(copy);
                        }}
                        style={{ width: "100%", padding: 8 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    <td style={{ padding: 14 }}>
                      <input
                        value={row.comments}
                        onChange={e => {
                          const copy = [...mergedItems];
                          copy[idx].comments = e.target.value;
                          setMergedItems(copy);
                        }}
                        style={{ width: "100%", padding: 10 }}
                      />
                    </td>

                    <td style={{ padding: 14 }}>
                      {row.id ? (
                        <button
                          style={{ color: "red" }}
                          onClick={async () => {
                            await fetch(`${API_BASE}/items/${row.id}/`, {
                              method: "DELETE"
                            });
                            const updated = [...mergedItems];
                            updated[idx].deleted = true;
                            setMergedItems(updated);
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          style={{ color: "red" }}
                          onClick={() => {
                            const updated = [...mergedItems];
                            updated[idx].deleted = true;
                            setMergedItems(updated);
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={saveSelectedChanges}>Save Changes</button>
            <button onClick={() => setSelected(null)}>Close</button>
            <button
              style={{ color: "red" }}
              onClick={() => deletePreflight(selected.flight_number)}
            >
              Delete Preflight
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
