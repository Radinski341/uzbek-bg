// src/app/admin/banners/page.tsx
"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";
import BannerForm from "@/components/BannerForm";
import BannerPreview from "@/components/BannerPreview";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function BannersPage() {
  const { data: tData } = useSWR("/api/templates", fetcher);
  const { data: bData, mutate } = useSWR("/api/banners", fetcher);
  const [templateId, setTemplateId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);

  useEffect(() => {
    if (tData?.templates?.[0] && !templateId) {
      setTemplateId(tData.templates[0].id);
    }
  }, [tData, templateId]);

  const handleSave = async (formData: FormData, isEdit = false, id?: string) => {
    if (isEdit && id) {
      await fetch(`/api/banners/${id}`, { method: "PUT", body: formData });
    } else {
      formData.set("templateId", templateId);
      await fetch("/api/banners", { method: "POST", body: formData });
    }
    mutate();
  };

  async function deleteBanner(id: string) {
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    mutate();
  }

  const tmpl = tData?.templates?.find((t: any) => t.id === templateId);

  return (
    <div className="container grid" style={{ padding: "1rem" }}>
      <h2>Banners</h2>
      <button onClick={() => setShowAddForm(true)}>Add New Banner</button>

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
          <div className="card grid" style={{ width: "100%", maxWidth: 680, margin: "1rem", background: "#0f172a" }}>
            <h3>Add New Banner</h3>
            <label>Template</label>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">Select a template</option>
              {tData?.templates?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {templateId && tmpl && (
              <BannerForm
                fields={tmpl.fields}
                initialData={{}}
                onSubmit={async (fd) => {
                  await handleSave(fd);
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
        {bData?.banners?.map((b: any) => (
          <div key={b.id} className="card grid" style={{ padding: "1rem" }}>
            <h3>{b.template.name}</h3>
            <BannerPreview templateKey={b.template.key} data={b.data} />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <a href={`/banner/${b.id}`} target="_blank">
                Preview
              </a>
              <button onClick={() => setEditingBanner(b)}>Edit</button>
              <button onClick={() => deleteBanner(b.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editingBanner && (
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
          <div className="card grid" style={{ width: "100%", maxWidth: 680, margin: "1rem", background: "#0f172a" }}>
            <h3>Editing {editingBanner.id}</h3>
            <BannerForm
              fields={editingBanner.template.fields}
              initialData={editingBanner.data}
              onSubmit={async (fd) => {
                await handleSave(fd, true, editingBanner.id);
                setEditingBanner(null);
              }}
              onCancel={() => setEditingBanner(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}