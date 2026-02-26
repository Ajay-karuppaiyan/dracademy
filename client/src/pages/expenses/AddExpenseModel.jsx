import React, { useState } from "react";
import { XCircle, Plus } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AddExpenseModal = ({ isOpen, onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setName("");
    setTitle("");
    setCategory("");
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setReceipt(null);
  };

  /* ================= FILE VALIDATION ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setReceipt(file);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !title.trim() || !category.trim()) {
      toast.error("Name, Title, and Category are required");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("title", title.trim());
      formData.append("category", category.trim());
      formData.append("amount", Number(amount));
      formData.append("description", description.trim());
      formData.append("date", date);

      if (receipt) {
        formData.append("receipt", receipt);
      }

      await api.post("/expenses", formData);

      toast.success("Expense added successfully!");
      onAdded?.();
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to add expense"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center"
      onClick={() => {
        resetForm();
        onClose();
      }}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <XCircle size={24} />
        </button>

        <h2 className="text-lg font-bold mb-4 text-slate-800">
          Add Expense
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border px-3 py-2 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-3 py-2 rounded-lg"
            min="1"
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 rounded-lg"
            rows="3"
          />

          <input
            type="file"
            onChange={handleFileChange}
            className="border px-3 py-2 rounded-lg"
            accept=".jpg,.jpeg,.png,.pdf"
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={loading}
              className="w-full border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 transition"
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;