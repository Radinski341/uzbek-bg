// src/app/admin/slides/page.tsx
"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";
import BannerPreview from "@/components/BannerPreview";

const fetcher = (u: string) => fetch(u).then(r => r.json());

function SlideCard({ slide, setEditingSlide, deleteSlide }: { slide: any; setEditingSlide: any; deleteSlide: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slide.items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slide.items.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [slide.items.length]);

  return (
    <div className="card grid" style={{ padding: "1rem" }}>
      <h3>{slide.name}</h3>
      <p>Speed: {slide.speedMs}ms • Effect: {slide.effect} • Banners: {slide.items.length}</p>
      <div style={{ width: "300px", height: "169px", position: "relative" }}>
        {slide.items.map((item: any, i: number) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: i === currentIndex ? "block" : "none",
            }}
          >
            <BannerPreview templateKey={item.banner.template.key} data={item.banner.data} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <a href={`/slide/${slide.id}`} target="_blank">Preview</a>
        <button onClick={() => setEditingSlide(slide)}>Edit</button>
        <button onClick={() => deleteSlide(slide.id)}>Delete</button>
      </div>
    </div>
  );
}

export default function SlidesPage() {
  const { data: bData } = useSWR("/api/banners", fetcher);
  const { data: sData, mutate } = useSWR("/api/slides", fetcher);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [speedMs, setSpeedMs] = useState(8000);
  const [effect, setEffect] = useState<"FADE" | "SLIDE">("FADE");
  const [selected, setSelected] = useState<string[]>([]);

  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editSpeedMs, setEditSpeedMs] = useState(8000);
  const [editEffect, setEditEffect] = useState<"FADE" | "SLIDE">("FADE");
  const [editSelected, setEditSelected] = useState<string[]>([]);

  useEffect(() => {
    if (editingSlide) {
      setEditName(editingSlide.name);
      setEditSpeedMs(editingSlide.speedMs);
      setEditEffect(editingSlide.effect);
      setEditSelected(editingSlide.items.map((i: any) => i.bannerId));
    }
  }, [editingSlide]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function editToggle(id: string) {
    setEditSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function create() {
    await fetch("/api/slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, speedMs, effect, bannerIds: selected }),
    });
    setName("");
    setSelected([]);
    setShowAddForm(false);
    mutate();
  }

  async function update(id: string) {
    await fetch(`/api/slides/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, speedMs: editSpeedMs, effect: editEffect, bannerIds: editSelected }),
    });
    setEditingSlide(null);
    mutate();
  }

  async function deleteSlide(id: string) {
    await fetch(`/api/slides/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="container grid" style={{ padding: "1rem" }}>
      <h2>Slides</h2>
      <button onClick={() => setShowAddForm(true)}>Add New Slide</button>

      {showAddForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <div className="card grid" style={{ width: "100%", maxWidth: 720, margin: "1rem", background: "#0f172a" }}>
            <h3>Add New Slide</h3>
            <input placeholder="Slide name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="row">
              <label>
                Speed (ms){" "}
                <input type="number" min={1500} step={500} value={speedMs} onChange={(e) => setSpeedMs(Number(e.target.value))} />
              </label>
              <label>
                Effect
                <select value={effect} onChange={(e) => setEffect(e.target.value as any)}>
                  <option value="FADE">Fade</option>
                  <option value="SLIDE">Slide</option>
                </select>
              </label>
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>Banners</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                {bData?.banners?.map((b: any) => (
                  <div key={b.id} className="card grid" style={{ padding: "0.5rem" }}>
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} />
                      {b.template.name} • {b.id.slice(0, 6)}
                    </label>
                    <BannerPreview templateKey={b.template.key} data={b.data} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={create}>Create Slide</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        {sData?.slides?.map((s: any) => (
          <SlideCard key={s.id} slide={s} setEditingSlide={setEditingSlide} deleteSlide={deleteSlide} />
        ))}
      </div>

      {editingSlide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <div className="card grid" style={{ width: "100%", maxWidth: 720, margin: "1rem", background: "#0f172a" }}>
            <h3>Editing {editingSlide.name}</h3>
            <input placeholder="Slide name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <div className="row">
              <label>
                Speed (ms){" "}
                <input type="number" min={1500} step={500} value={editSpeedMs} onChange={(e) => setEditSpeedMs(Number(e.target.value))} />
              </label>
              <label>
                Effect
                <select value={editEffect} onChange={(e) => setEditEffect(e.target.value as any)}>
                  <option value="FADE">Fade</option>
                  <option value="SLIDE">Slide</option>
                </select>
              </label>
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>Banners</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                {bData?.banners?.map((b: any) => (
                  <div key={b.id} className="card grid" style={{ padding: "0.5rem" }}>
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="checkbox" checked={editSelected.includes(b.id)} onChange={() => editToggle(b.id)} />
                      {b.template.name} • {b.id.slice(0, 6)}
                    </label>
                    <BannerPreview templateKey={b.template.key} data={b.data} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => update(editingSlide.id)}>Update Slide</button>
            <button type="button" onClick={() => setEditingSlide(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}