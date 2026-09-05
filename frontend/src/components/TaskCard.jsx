import { useNavigate } from "react-router-dom";

const priorityColors = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
};

const statusColors = {
  Pending: "status-pending",
  "In Progress": "status-progress",
  Completed: "status-completed",
};

function TaskCard({ task, onDelete, onStatusChange }) {
  const navigate = useNavigate();

  return (
    <div className={`task-card ${statusColors[task.status]}`}>
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`badge ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        {task.dueDate && (
          <span className="due-date">
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        <span className={`badge ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>

      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <button
          className="btn-icon edit"
          onClick={() => navigate(`/edit-task/${task._id}`)}
        >
          ✏️
        </button>
        <button className="btn-icon delete" onClick={() => onDelete(task._id)}>
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskCard;