import { useEffect, useState } from "react";
import {
  getTasks,
  addTask,
  deleteTask,
  toggleTask,
} from "./services/api";
import "./App.css";

function App() {
  /* -------------------- STATE -------------------- */

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // ✅ Initialize theme from localStorage (NO effect needed)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  /* -------------------- THEME SYNC -------------------- */

  // ✅ Effect ONLY syncs external systems (DOM + localStorage)
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  /* -------------------- DATA LOAD -------------------- */

  useEffect(() => {
    const loadTasks = async () => {
      const res = await getTasks();
      setTasks(res.data);
    };
    loadTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  /* -------------------- ACTIONS -------------------- */

  const handleAdd = async () => {
    if (!title.trim()) return;

    await addTask({
      id: Date.now(),
      title,
      completed: false,
    });

    setTitle("");
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
    fetchTasks();
  };

  const handleToggle = async (id) => {
    await toggleTask(id);
    fetchTasks();
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <h2>📝 Task Manager</h2>
          <button className="theme-btn" onClick={toggleTheme}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="input-group">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a new task..."
          />
          <button onClick={handleAdd}>Add</button>
        </div>

        {tasks.length === 0 ? (
          <p className="empty">No tasks yet</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task.id)}
                  />
                  <span className={task.completed ? "done" : ""}>
                    {task.title}
                  </span>
                </label>
                <button onClick={() => handleDelete(task.id)}>❌</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
