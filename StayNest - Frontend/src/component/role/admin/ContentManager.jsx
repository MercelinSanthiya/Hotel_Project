
import { useState } from "react";
import { adminSections } from "./adminSections";
import { sectionHooks } from "./sectionHooks";
import { resolveImageUrl } from "../../../constants/apiConstants";
import "./ContentManager.css";


const emptyRowFrom = (fields) =>
  fields.reduce((acc, f) => ({ ...acc, [f.key]: f.type === "checkbox" ? false : "" }), {});

const toDateInputValue = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const toDateTimeInputValue = (value) => {
  if (!value) return "";
  // Accept both "yyyy-MM-ddTHH:mm[:ss]" and ISO strings with a "Z"/offset.
  const raw = String(value);
  return raw.length >= 16 ? raw.slice(0, 16) : raw;
};

const ContentManager = ({ sectionKey }) => {
  const section = adminSections[sectionKey];
  const hooks = sectionHooks[sectionKey];

  const { data: rows = [], isLoading, isError, error, refetch } = hooks.useGetAll();
  const [addItem, { isLoading: isAdding }] = hooks.useAdd();
  const [updateItem, { isLoading: isUpdating }] = hooks.useUpdate();
  const [deleteItem] = hooks.useDelete();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyRowFrom(section.fields));
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null); 
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState("");

  const isSaving = isAdding || isUpdating;

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyRowFrom(section.fields));
    setImageFile(null);
    setExistingImageUrl(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingId(row.id);
    setForm(
      section.fields.reduce((acc, f) => {
        if (f.type === "checkbox") {
          return { ...acc, [f.key]: Boolean(row[f.key]) };
        }
        if (f.type === "date") {
          return { ...acc, [f.key]: toDateInputValue(row[f.key]) };
        }
        if (f.type === "datetime-local") {
          return { ...acc, [f.key]: toDateTimeInputValue(row[f.key]) };
        }
        return { ...acc, [f.key]: row[f.key] ?? "" };
      }, {})
    );
    setImageFile(null);
    setExistingImageUrl(row.imageUrl ?? null);
    setFormError("");
    setModalOpen(true);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (section.hasImage && section.imageRequiredOnCreate && !editingId && !imageFile) {
      setFormError("Please choose an image.");
      return;
    }

    const payload = { ...form };
    if (sectionKey === "users" && !payload.password) {
      delete payload.password;
    }

    try {
      if (section.hasImage) {
        payload.image = imageFile; 
      }

      if (editingId) {
        await updateItem({ id: editingId, ...payload }).unwrap();
      } else {
        await addItem(payload).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err?.data?.message || "Something went wrong while saving. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Remove this ${section.singular.toLowerCase()}? This can't be undone.`)) {
      try {
        await deleteItem(id).unwrap();
      } catch (err) {
        alert(err?.data?.message || "Couldn't delete that - please try again.");
      }
    }
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cm">
      <div className="cm-header">
        <div>
          <h1 className="cm-title">{section.title}</h1>
          <p className="cm-subtitle">
            {isLoading
              ? "Loading…"
              : `${rows.length} ${rows.length === 1 ? section.singular.toLowerCase() : `${section.singular.toLowerCase()}s`} on record`}
          </p>
        </div>
        <div className="cm-header-actions">
          <input
            className="cm-filter"
            type="search"
            placeholder={`Filter ${section.title.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="cm-add-btn" onClick={openAddModal}>
            + Add {section.singular}
          </button>
        </div>
      </div>

      {isError && (
        <div className="cm-error-banner">
          Couldn't load {section.title.toLowerCase()} from the server.{" "}
          <button className="cm-link-btn" onClick={refetch}>Try again</button>
        </div>
      )}

      <div className="cm-table-wrap">
        <table className="cm-table">
          <thead>
            <tr>
              {section.hasImage && <th>Image</th>}
              {section.fields
                .filter((f) => f.key !== "password") 
                .map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
              <th className="cm-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={section.fields.length + 1 + (section.hasImage ? 1 : 0)} className="cm-empty">
                  Nothing here yet. Add a {section.singular.toLowerCase()} to get started.
                </td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row.id}>
                {section.hasImage && (
                  <td>
                    <img
                      src={resolveImageUrl(row.imageUrl)}
                      alt={row.name || row.caption || ""}
                      className="cm-thumb"
                    />
                  </td>
                )}
                {section.fields
                  .filter((f) => f.key !== "password")
                  .map((f) => (
                    <td key={f.key}>
                      {f.key === "status" ? (
                        <>
                          <span className={`cm-status cm-status-${String(row[f.key]).toLowerCase().replace(/\s+/g, "-")}`}>
                            {row[f.key]}
                          </span>
                          {sectionKey === "rooms" &&
                            String(row.status).toLowerCase() !== "available" &&
                            row.availableFrom && (
                              <div className="cm-status-note">
                                Auto-frees {toDateInputValue(row.availableFrom)}
                              </div>
                            )}
                          {sectionKey === "bookings" &&
                            String(row.status).toLowerCase() === "cancelled" &&
                            row.cancelledBy === "user" && (
                              <div className="cm-status-note">
                                The booking was cancelled by the user
                              </div>
                            )}
                        </>
                      ) : f.type === "checkbox" ? (
                        row[f.key] ? "Yes" : "No"
                      ) : f.type === "date" ? (
                        toDateInputValue(row[f.key]) || "—"
                      ) : (
                        row[f.key] || (["text", "textarea"].includes(f.type) ? "—" : row[f.key])
                      )}
                    </td>
                  ))}
                <td className="cm-actions-col">
                  <button className="cm-link-btn" onClick={() => openEditModal(row)}>
                    Edit
                  </button>
                  <button className="cm-link-btn cm-link-danger" onClick={() => handleDelete(row.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="cm-modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="cm-modal-title">
              {editingId ? `Edit ${section.singular.toLowerCase()}` : `Add ${section.singular.toLowerCase()}`}
            </h2>
            <form onSubmit={handleSave} className="cm-form">
              {section.hasImage && (
                <label className="cm-field">
                  <span>Photo{section.imageRequiredOnCreate && !editingId ? " (required)" : ""}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {(imageFile || existingImageUrl) && (
                    <img
                      className="cm-preview"
                      alt="Preview"
                      src={imageFile ? URL.createObjectURL(imageFile) : resolveImageUrl(existingImageUrl)}
                    />
                  )}
                </label>
              )}

              {section.fields.map((f) => (
                <label
                  key={f.key}
                  className={f.type === "checkbox" ? "cm-field cm-field-checkbox" : "cm-field"}
                >
                  {f.type === "checkbox" ? (
                    <>
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        onChange={(e) => handleChange(f.key, e.target.checked)}
                      />
                      <span>{f.label}</span>
                    </>
                  ) : (
                    <>
                      <span>{f.label}</span>
                      {f.type === "select" ? (
                        <select
                          value={form[f.key] ?? ""}
                          onChange={(e) => handleChange(f.key, e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select {f.label.toLowerCase()}
                          </option>
                          {f.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={form[f.key] ?? ""}
                          onChange={(e) => handleChange(f.key, e.target.value)}
                        />
                      ) : (
                        <>
                          <input
                            type={
                              f.type === "number" || f.type === "percent"
                                ? "number"
                                : f.type === "date"
                                ? "date"
                                : f.type === "datetime-local"
                                ? "datetime-local"
                                : f.key === "password"
                                ? "password"
                                : "text"
                            }
                            min={f.type === "percent" ? 0 : undefined}
                            max={f.type === "percent" ? 100 : undefined}
                            step={f.type === "percent" ? 1 : undefined}
                            inputMode={f.type === "percent" ? "numeric" : undefined}
                            value={
                              f.type === "date"
                                ? toDateInputValue(form[f.key])
                                : f.type === "datetime-local"
                                ? toDateTimeInputValue(form[f.key])
                                : form[f.key] ?? ""
                            }
                            onChange={(e) => handleChange(f.key, e.target.value)}
                            required={f.required !== false && f.key !== "password"}
                            placeholder={
                              f.key === "password" && editingId
                                ? "Leave blank to keep unchanged"
                                : f.placeholder
                            }
                          />
                          {f.helpText && <small className="cm-field-hint">{f.helpText}</small>}
                        </>
                      )}
                    </>
                  )}
                </label>
              ))}

              {formError && <div className="cm-form-error">{formError}</div>}

              <div className="cm-modal-actions">
                <button type="button" className="cm-cancel-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="cm-save-btn" disabled={isSaving}>
                  {isSaving ? "Saving…" : editingId ? "Save changes" : `Add ${section.singular.toLowerCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;