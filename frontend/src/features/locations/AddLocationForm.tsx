import { useState, type FormEvent } from "react";
import {
  LOCATION_CATEGORIES,
  LOCATION_STATUSES,
  type CreateLocationPayload,
  type LocationCategory,
  type LocationStatus,
} from "./locationTypes";

interface AddLocationFormProps {
  onCreate: (payload: CreateLocationPayload) => Promise<void>;
}

const initialState: CreateLocationPayload = {
  name: "",
  description: "",
  latitude: 6.9271,
  longitude: 79.8612,
  category: "Commercial",
  status: "Active",
};

export function AddLocationForm({ onCreate }: AddLocationFormProps) {
  const [form, setForm] = useState<CreateLocationPayload>(initialState);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await onCreate(form);
      setForm(initialState);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <h3>Add Location</h3>
      <input
        required
        value={form.name}
        placeholder="Name"
        onChange={(event) =>
          setForm((old) => ({ ...old, name: event.target.value }))
        }
      />
      <textarea
        required
        value={form.description}
        placeholder="Description"
        onChange={(event) =>
          setForm((old) => ({ ...old, description: event.target.value }))
        }
      />
      <div className="inline-fields">
        <input
          type="number"
          step="any"
          required
          value={form.latitude}
          placeholder="Latitude"
          onChange={(event) =>
            setForm((old) => ({ ...old, latitude: Number(event.target.value) }))
          }
        />
        <input
          type="number"
          step="any"
          required
          value={form.longitude}
          placeholder="Longitude"
          onChange={(event) =>
            setForm((old) => ({
              ...old,
              longitude: Number(event.target.value),
            }))
          }
        />
      </div>
      <div className="inline-fields">
        <select
          value={form.category}
          onChange={(event) =>
            setForm((old) => ({
              ...old,
              category: event.target.value as LocationCategory,
            }))
          }
        >
          {LOCATION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={form.status}
          onChange={(event) =>
            setForm((old) => ({
              ...old,
              status: event.target.value as LocationStatus,
            }))
          }
        >
          {LOCATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add Location"}
      </button>
    </form>
  );
}
