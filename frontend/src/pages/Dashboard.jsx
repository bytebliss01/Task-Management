import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import Toast from "../components/Toast.jsx";

const priorityOrder = { High: 0, Medium: 1, Low: 2 };

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const requestDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmDelete = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast("Task deleted", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete task", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
      showToast("Task updated", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update task", "error");
    }
  };

  const counts = useMemo(() => {
    return {
      All: tasks.length,
      Pending: tasks.filter((t) => t.status === "Pending").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      Completed: tasks.filter((t) => t.status === "Completed").length,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let result =
      filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    if (sortBy === "dueDate") {
      result = [...result].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === "priority") {
      result = [...result].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }

    return result;
  }, [tasks, filter, search, sortBy]);

  return (
    <div className="page">
      <Navbar />
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Tasks</h1>
          <p className="stats-text">
            {counts.Completed}/{counts.All} tasks completed
          </p>
        </div>

        <div className="toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="none">Sort by</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div className="filter-bar">
          {["All", "Pending", "In Progress", "Completed"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {loading && (
          <p className="empty-state">⏳ Loading your tasks...</p>
        )}

        {error && <p className="error-message">{error}</p>}

        {!loading && visibleTasks.length === 0 && (
          <p className="empty-state">
            {search
              ? "🔍 No tasks match your search."
              : "📝 No tasks here yet. Create one!"}
          </p>
        )}

        <div className="task-grid">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={requestDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Delete this task?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn btn-logout" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;