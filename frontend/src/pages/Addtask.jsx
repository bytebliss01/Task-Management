import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";

function AddTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;
    const loadTask = async () => {
      try {
        const res = await api.get("/tasks");
        const task = res.data.find((t) => t._id === id);
        if (task) {
          setFormData({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
          });
        }
      } catch (err) {
        setError("Failed to load task");
      }
    };
    loadTask();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isEditMode) {
        await api.put(`/tasks/${id}`, formData);
      } else {
        await api.post("/tasks", formData);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="form-page">
        <div className="auth-card">
          <h1>{isEditMode ? "Edit Task" : "Add New Task"}</h1>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <button type="submit">{isEditMode ? "Update Task" : "Create Task"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTask;