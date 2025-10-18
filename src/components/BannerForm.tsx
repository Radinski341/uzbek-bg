// src/components/BannerForm.tsx
"use client";
import { useState } from "react";

type Field = {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  isArray: boolean;
  config?: any;
  order: number;
};

type Props = {
  fields: Field[];
  initialData?: Record<string, any>;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
};

function defaultValueForType(type: string): any {
  switch (type) {
    case "TEXT":
    case "RICHTEXT":
    case "COLOR":
    case "SELECT":
      return "";
    case "NUMBER":
      return 0;
    case "BOOLEAN":
      return false;
    case "IMAGE":
      return "";
    default:
      return null;
  }
}

function FieldInput({
  field,
  value,
  setValue,
  setFile,
}: {
  field: Field;
  value: any;
  setValue: (val: any) => void;
  setFile?: (key: string, file: File | File[]) => void;
}) {
  const { key, label, type, required, isArray, config } = field;

  if (isArray) {
    const items = value || [];
    const itemSchema = config?.itemSchema;

    const addItem = () => {
      let newItem: any;
      if (itemSchema) {
        newItem = {};
        for (let sk in itemSchema) {
          newItem[sk] = defaultValueForType(itemSchema[sk].type);
        }
      } else {
        newItem = defaultValueForType(type);
      }
      setValue([...items, newItem]);
    };

    const removeItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setValue(newItems);
    };

    const updateItem = (index: number, newItemVal: any) => {
      const newItems = [...items];
      newItems[index] = newItemVal;
      setValue(newItems);
    };

    if (type === "IMAGE") {
      // Special handling for image arrays
      return (
        <div className="grid">
          <label>{label}</label>
          {items.map((url: string, i: number) => (
            <div key={i} className="row" style={{ alignItems: "center" }}>
              <img src={url} alt="" style={{ width: 100 }} />
              <button type="button" onClick={() => removeItem(i)}>
                Remove
              </button>
            </div>
          ))}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (setFile) {
                setFile(key, Array.from(e.target.files || []));
              }
            }}
          />
        </div>
      );
    } else if (itemSchema) {
      // Array of objects
      return (
        <div className="grid">
          <label>{label}</label>
          {items.map((item: any, i: number) => (
            <div key={i} className="card grid">
              {Object.entries(itemSchema).map(([sk, sf]: [string, any]) => (
                <FieldInput
                  key={sk}
                  field={{
                    id: `${key}-${i}-${sk}`,
                    key: sk,
                    label: sf.label || sk,
                    type: sf.type,
                    required: sf.required || false,
                    isArray: false,
                    config: sf.config,
                    order: 0,
                  }}
                  value={item[sk]}
                  setValue={(val) => updateItem(i, { ...item, [sk]: val })}
                  setFile={() => {}}
                />
              ))}
              <button type="button" onClick={() => removeItem(i)}>
                Remove Item
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem}>
            Add Item
          </button>
        </div>
      );
    } else {
      // Simple array (e.g., array of TEXT, NUMBER)
      return (
        <div className="grid">
          <label>{label}</label>
          {items.map((item: any, i: number) => (
            <div key={i} className="row">
              <FieldInput
                field={{ ...field, label: "", isArray: false, id: `${key}-${i}` }}
                value={item}
                setValue={(val) => updateItem(i, val)}
                setFile={() => {}}
              />
              <button type="button" onClick={() => removeItem(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem}>
            Add
          </button>
        </div>
      );
    }
  } else {
    // Scalar field
    let input;
    switch (type) {
      case "TEXT":
        input = (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            required={required}
          />
        );
        break;
      case "NUMBER":
        input = (
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) =>
              setValue(e.target.value === "" ? null : Number(e.target.value))
            }
            required={required}
          />
        );
        break;
      case "BOOLEAN":
        input = (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setValue(e.target.checked)}
          />
        );
        break;
      case "COLOR":
        input = (
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => setValue(e.target.value)}
            required={required}
          />
        );
        break;
      case "SELECT":
        input = (
          <select
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            required={required}
          >
            <option value="">Select</option>
            {(config?.options || []).map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
        break;
      case "RICHTEXT":
        input = (
          <textarea
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            required={required}
          />
        );
        break;
      case "IMAGE":
        input = (
          <div>
            {value && <img src={value} alt="" style={{ width: 200 }} />}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile && setFile(key, e.target.files[0]);
                }
              }}
              required={required && !value}
            />
          </div>
        );
        break;
      default:
        input = null;
    }
    return (
      <div className="grid">
        <label>{label}</label>
        {input}
      </div>
    );
  }
}

export default function BannerForm({ fields, initialData = {}, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState(initialData);
  const [fileMap, setFileMap] = useState<Record<string, File | File[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    for (let f of fields) {
      const key = f.key;
      const value = formData[key];
      if (f.type !== "IMAGE") {
        if (f.isArray) {
          fd.set(`${key}__json`, JSON.stringify(value || []));
        } else {
          fd.set(key, value == null ? "" : String(value));
        }
      } else {
        if (f.isArray) {
          fd.set(`${key}_existing`, JSON.stringify(value || []));
        }
        // scalar image: if file in fileMap, appended below; else keep old (not set)
      }
    }
    for (let key in fileMap) {
      const files = fileMap[key];
      if (Array.isArray(files)) {
        files.forEach((file) => fd.append(key, file));
      } else if (files) {
        fd.append(key, files);
      }
    }
    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="grid">
      {fields.map((f) => (
        <FieldInput
          key={f.id}
          field={f}
          value={formData[f.key]}
          setValue={(val) => setFormData((prev) => ({ ...prev, [f.key]: val }))}
          setFile={(k, file) => setFileMap((prev) => ({ ...prev, [k]: file }))}
        />
      ))}
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}