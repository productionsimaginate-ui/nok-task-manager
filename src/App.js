import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://ngfccxhxouuwvjjekemw.supabase.co";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZmNjeGh4b3V1d3ZqamVrZW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDg2OTMsImV4cCI6MjA4ODgyNDY5M30.wnn0f66K8gjno4-ffVv6lJhpw_UDFz85R6ZIbr4uJ4M";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── TEAM CONFIG ──────────────────────────────────────────────────────────────
const TEAM = [
  { name: "Meraj Lakhani", dept: "Founder, Director & Client Manager", isAdmin: true },
  { name: "Karan Karar", dept: "Motion Graphics & Illustration", isAdmin: false },
  { name: "Javed Madhani", dept: "Graphic Designer", isAdmin: false },
  { name: "Nishita Thakkar", dept: "Social Media Manager", isAdmin: false },
  { name: "Rishita Thar", dept: "Copywriter", isAdmin: false },
];
const EMPLOYEES = TEAM.filter(t => !t.isAdmin).map(t => t.name);
const DEPARTMENTS = [...new Set(TEAM.map(t => t.dept))];
const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["Todo", "In Progress", "Review", "Done"];

const P_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const S_COLOR = { "Todo": "#6b7280", "In Progress": "#8B2FC9", "Review": "#F5C518", "Done": "#22c55e" };

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --purple: #8B2FC9; --yellow: #F5C518; --dark: #0a0a0a;
    --card: #141414; --border: #222; --text: #f0f0f0; --muted: #666;
  }
  body { background: var(--dark); color: var(--text); font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
  input, textarea, select { outline: none; font-family: 'DM Sans', sans-serif; }
  input:focus, textarea:focus, select:focus { border-color: var(--purple) !important; }
  button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 32 }) => {
  const colors = ["#8B2FC9","#F5C518","#ef4444","#22c55e","#3b82f6","#f97316"];
  const c = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.38, color: "#fff", flexShrink: 0, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
};

const Badge = ({ label, color }) => (
  <span style={{ background: color + "18", color, border: `1px solid ${color}33`, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, letterSpacing: 0.4, whiteSpace: "nowrap" }}>{label}</span>
);

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div className="spin" style={{ width: 28, height: 28, border: "3px solid #222", borderTopColor: "#8B2FC9", borderRadius: "50%" }} />
  </div>
);

const Modal = ({ children, onClose, width = 640 }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div onClick={e => e.stopPropagation()} className="fade-in" style={{ background: "#111", border: "1px solid #222", borderRadius: 20, width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto", position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "#1e1e1e", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", zIndex: 10, fontSize: 16 }}>✕</button>
      {children}
    </div>
  </div>
);

const inp = { background: "#181818", border: "1px solid #2a2a2a", borderRadius: 9, color: "#ddd", padding: "10px 13px", fontSize: 13, width: "100%", transition: "border 0.2s" };
const sel = { ...inp, cursor: "pointer" };

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    const member = TEAM.find(t => t.name.toLowerCase().replace(/\s/g, "") === email.split("@")[0].toLowerCase().replace(/\s/g, ""));
    onLogin({ email, name: member?.name || email.split("@")[0], isAdmin: member?.isAdmin || false, dept: member?.dept || "" });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: "#F5C518", borderRadius: 14, padding: "8px 22px", marginBottom: 14 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: "#111", letterSpacing: 2 }}>NOK</span>
          </div>
          <div style={{ color: "#8B2FC9", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>Noise of Kalakaars</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#f0f0f0", letterSpacing: 2, marginBottom: 6 }}>Task Manager</h1>
          <p style={{ color: "#555", fontSize: 14 }}>Sign in to your workspace</p>
        </div>
        <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 20, padding: 28 }}>
          {error && <div style={{ background: "#ef444418", border: "1px solid #ef444433", borderRadius: 9, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>EMAIL</label>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="yourname@nok.co.in" style={inp} type="email" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>PASSWORD</label>
            <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={inp} type="password" />
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", background: loading ? "#333" : "linear-gradient(135deg, #8B2FC9, #6a1fa0)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, transition: "all 0.2s" }}>
            {loading ? "SIGNING IN..." : "ENTER WORKSPACE →"}
          </button>
          <p style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 16 }}>Contact Meraj to get your login credentials</p>
        </div>
      </div>
    </div>
  );
}

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, onClick, updatesCount, commentsCount, isAdmin, onDelete }) {
  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / 86400000);
  const overdue = daysLeft < 0 && task.status !== "Done";
  return (
    <div onClick={onClick} className="fade-in" style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#8B2FC9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: P_COLOR[task.priority] }} />
      <div style={{ paddingLeft: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f0", lineHeight: 1.4, flex: 1 }}>{task.title}</span>
          <Badge label={task.status} color={S_COLOR[task.status]} />
        </div>
        {task.description && <p style={{ color: "#666", fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? "…" : ""}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Avatar name={task.assignee_name} size={20} />
            <span style={{ color: "#999", fontSize: 12 }}>{task.assignee_name}</span>
          </div>
          <Badge label={task.priority} color={P_COLOR[task.priority]} />
          <span style={{ marginLeft: "auto", fontSize: 11, color: overdue ? "#ef4444" : "#555", fontWeight: overdue ? 700 : 400 }}>
            {overdue ? `⚠ ${Math.abs(daysLeft)}d overdue` : task.status === "Done" ? "✓ Done" : `${daysLeft}d left`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e1e1e", alignItems: "center" }}>
          <span style={{ color: "#444", fontSize: 11 }}>↻ {updatesCount}</span>
          <span style={{ color: "#444", fontSize: 11 }}>💬 {commentsCount}</span>
          {task.has_attachment && <span style={{ color: "#444", fontSize: 11 }}>📎 1</span>}
          {isAdmin && (
            <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
              style={{ marginLeft: "auto", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 6, color: "#555", padding: "2px 8px", fontSize: 11 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#555"; }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TASK FORM ────────────────────────────────────────────────────────────────
function TaskForm({ initial, onSave, onClose, loading }) {
  const blank = { title: "", description: "", assignee_name: EMPLOYEES[0], department: DEPARTMENTS[1], priority: "Medium", deadline: "", status: "Todo" };
  const [form, setForm] = useState(initial || blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: 28 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#f0f0f0", letterSpacing: 2, marginBottom: 24 }}>
          {initial ? "✏️ EDIT TASK" : "➕ ASSIGN NEW TASK"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>TASK TITLE *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Design campaign visuals" style={inp} />
          </div>
          <div>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>DESCRIPTION</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Task details, deliverables…" rows={3} style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>ASSIGN TO</label>
              <select value={form.assignee_name} onChange={e => set("assignee_name", e.target.value)} style={sel}>
                {EMPLOYEES.map(e => <option key={e} value={e} style={{ background: "#1a1a1a" }}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>PRIORITY</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} style={{ ...sel, color: P_COLOR[form.priority] }}>
                {PRIORITIES.map(p => <option key={p} value={p} style={{ background: "#1a1a1a", color: P_COLOR[p] }}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>DEADLINE</label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} style={{ ...inp, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: 1 }}>STATUS</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} style={sel}>
                {STATUSES.map(s => <option key={s} value={s} style={{ background: "#1a1a1a" }}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, background: "#1e1e1e", color: "#888", border: "1px solid #2a2a2a", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700 }}>Cancel</button>
            <button onClick={() => form.title && form.deadline && onSave(form)} disabled={loading}
              style={{ flex: 2, background: loading ? "#333" : "linear-gradient(135deg, #8B2FC9, #6a1fa0)", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
              {loading ? "SAVING..." : initial ? "SAVE CHANGES ✓" : "ASSIGN TASK ✓"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── TASK DETAIL ──────────────────────────────────────────────────────────────
function TaskDetail({ task, user, isAdmin, onClose, onStatusChange, onEdit, onRefresh }) {
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [newUpdate, setNewUpdate] = useState("");
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(task.attachment_url || null);
  const [saving, setSaving] = useState(false);
  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / 86400000);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await supabase.from("daily_updates").select("*").eq("task_id", task.id).order("created_at", { ascending: false });
      const { data: c } = await supabase.from("comments").select("*").eq("task_id", task.id).order("created_at", { ascending: false });
      setUpdates(u || []);
      setComments(c || []);
    };
    load();
  }, [task.id]);

  const postUpdate = async () => {
    if (!newUpdate.trim()) return;
    setSaving(true);
    await supabase.from("daily_updates").insert({ task_id: task.id, author: user.name, text: newUpdate });
    const { data } = await supabase.from("daily_updates").select("*").eq("task_id", task.id).order("created_at", { ascending: false });
    setUpdates(data || []);
    setNewUpdate("");
    setSaving(false);
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    setSaving(true);
    await supabase.from("comments").insert({ task_id: task.id, author: user.name, text: newComment });
    const { data } = await supabase.from("comments").select("*").eq("task_id", task.id).order("created_at", { ascending: false });
    setComments(data || []);
    setNewComment("");
    setSaving(false);
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `${task.id}/${file.name}`;
    await supabase.storage.from("task-attachments").upload(path, file, { upsert: true });
    const { data } = supabase.storage.from("task-attachments").getPublicUrl(path);
    await supabase.from("tasks").update({ attachment_url: data.publicUrl, has_attachment: true }).eq("id", task.id);
    setFileUrl(data.publicUrl);
    setUploading(false);
    onRefresh();
  };

  const timeAgo = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Badge label={task.priority} color={P_COLOR[task.priority]} />
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#f0f0f0", letterSpacing: 1, marginBottom: 8 }}>{task.title}</h2>
        {task.description && <p style={{ color: "#777", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{task.description}</p>}

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "14px 0", borderTop: "1px solid #1e1e1e", borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
          <div><div style={{ color: "#444", fontSize: 10, letterSpacing: 1, marginBottom: 5 }}>ASSIGNED TO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar name={task.assignee_name} size={24} /><span style={{ color: "#ddd", fontSize: 13 }}>{task.assignee_name}</span></div></div>
          <div><div style={{ color: "#444", fontSize: 10, letterSpacing: 1, marginBottom: 5 }}>DEADLINE</div>
            <div style={{ color: daysLeft < 0 && task.status !== "Done" ? "#ef4444" : "#ddd", fontSize: 13 }}>{task.deadline} {task.status !== "Done" && `(${daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`})`}</div></div>
          <div><div style={{ color: "#444", fontSize: 10, letterSpacing: 1, marginBottom: 5 }}>STATUS</div>
            {isAdmin ? (
              <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
                style={{ background: "#1a1a1a", color: S_COLOR[task.status], border: `1px solid ${S_COLOR[task.status]}44`, borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 700 }}>
                {STATUSES.map(s => <option key={s} value={s} style={{ background: "#1a1a1a", color: "#fff" }}>{s}</option>)}
              </select>
            ) : <Badge label={task.status} color={S_COLOR[task.status]} />}
          </div>
          {isAdmin && <button onClick={() => onEdit(task)} style={{ marginLeft: "auto", alignSelf: "center", background: "#8B2FC918", color: "#8B2FC9", border: "1px solid #8B2FC944", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>✏️ Edit Task</button>}
        </div>
      </div>

      {/* File Attachment */}
      <div style={{ padding: "0 28px 20px" }}>
        <div style={{ color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>📎 ATTACHMENT</div>
        {fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: "#8B2FC9", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>📄 View / Download File</a>
        ) : (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#181818", border: "1px dashed #333", borderRadius: 9, padding: "8px 14px", color: "#666", fontSize: 13, cursor: "pointer" }}>
            {uploading ? "Uploading…" : "＋ Upload File"}
            <input type="file" onChange={uploadFile} style={{ display: "none" }} />
          </label>
        )}
      </div>

      {/* Daily Updates */}
      <div style={{ padding: "0 28px 20px", borderTop: "1px solid #141414" }}>
        <div style={{ color: "#8B2FC9", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12, marginTop: 16 }}>↻ DAILY UPDATES</div>
        {!isAdmin && task.status !== "Done" && (
          <div style={{ marginBottom: 14 }}>
            <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="What did you work on today?" rows={2}
              style={{ ...inp, resize: "vertical", marginBottom: 8 }} />
            <button onClick={postUpdate} disabled={saving}
              style={{ background: "#8B2FC9", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
              {saving ? "POSTING…" : "POST UPDATE"}
            </button>
          </div>
        )}
        {updates.length === 0 ? <p style={{ color: "#333", fontSize: 13 }}>No updates yet.</p> :
          updates.map(u => (
            <div key={u.id} style={{ background: "#181818", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Avatar name={u.author} size={22} />
                <span style={{ color: "#aaa", fontWeight: 700, fontSize: 13 }}>{u.author}</span>
                <span style={{ color: "#333", fontSize: 11, marginLeft: "auto" }}>{timeAgo(u.created_at)}</span>
              </div>
              <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5 }}>{u.text}</p>
            </div>
          ))}
      </div>

      {/* Comments */}
      <div style={{ padding: "0 28px 28px", borderTop: "1px solid #141414" }}>
        <div style={{ color: "#F5C518", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12, marginTop: 16 }}>💬 COMMENTS</div>
        <div style={{ marginBottom: 14 }}>
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment…" rows={2}
            style={{ ...inp, resize: "vertical", marginBottom: 8 }} />
          <button onClick={postComment} disabled={saving}
            style={{ background: "#F5C518", color: "#111", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
            {saving ? "POSTING…" : "COMMENT"}
          </button>
        </div>
        {comments.length === 0 ? <p style={{ color: "#333", fontSize: 13 }}>No comments yet.</p> :
          comments.map(c => (
            <div key={c.id} style={{ background: "#181818", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Avatar name={c.author} size={22} />
                <span style={{ color: "#aaa", fontWeight: 700, fontSize: 13 }}>{c.author}</span>
                <span style={{ color: "#333", fontSize: 11, marginLeft: "auto" }}>{timeAgo(c.created_at)}</span>
              </div>
              <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}
      </div>
    </Modal>
  );
}

// ─── WEEKLY SUMMARY ───────────────────────────────────────────────────────────
function WeeklySummary({ tasks }) {
  const done = tasks.filter(t => t.status === "Done").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const now = new Date();
  return (
    <div className="fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[["Total", tasks.length, "#8B2FC9"], ["Done", done, "#22c55e"],
          ["Active", tasks.filter(t => t.status === "In Progress").length, "#F5C518"],
          ["Overdue", tasks.filter(t => t.status !== "Done" && new Date(t.deadline) < now).length, "#ef4444"]
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: "#141414", border: `1px solid ${c}22`, borderRadius: 14, padding: "20px 18px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: c, letterSpacing: 1 }}>{v}</div>
            <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{l} Tasks</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: "20px 18px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, color: "#ddd" }}>Overall Completion</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#8B2FC9", letterSpacing: 1 }}>{pct}%</span>
        </div>
        <div style={{ background: "#0a0a0a", borderRadius: 99, height: 8 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #8B2FC9, #F5C518)", borderRadius: 99, transition: "width 0.8s" }} />
        </div>
      </div>
      <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>TEAM BREAKDOWN</div>
      {EMPLOYEES.map(name => {
        const myTasks = tasks.filter(t => t.assignee_name === name);
        const myDone = myTasks.filter(t => t.status === "Done").length;
        const myActive = myTasks.filter(t => t.status === "In Progress").length;
        return (
          <div key={name} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Avatar name={name} size={36} />
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontWeight: 700, color: "#ddd", fontSize: 14 }}>{name}</div>
              <div style={{ color: "#444", fontSize: 12 }}>{TEAM.find(t => t.name === name)?.dept}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge label={`${myTasks.length} tasks`} color="#8B2FC9" />
              <Badge label={`${myDone} done`} color="#22c55e" />
              <Badge label={`${myActive} active`} color="#F5C518" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ATTENDANCE MODULE ────────────────────────────────────────────────────────
function AttendanceView({ user, isAdmin }) {
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [activeBreak, setActiveBreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [dayNote, setDayNote] = useState("");
  const [filterName, setFilterName] = useState("All");
  const [nfcCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  const today = new Date().toISOString().split("T")[0];

  const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const calcHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return null;
    const diffMs = new Date(clockOut) - new Date(clockIn);
    if (diffMs < 0) return "0.0";
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return (hours + mins / 60).toFixed(1);
  };

  const load = async () => {
    setLoading(true);
    const query = isAdmin
      ? supabase.from("attendance").select("*").order("created_at", { ascending: false })
      : supabase.from("attendance").select("*").eq("employee_name", user.name).order("created_at", { ascending: false });
    const { data } = await query;
    setAttendance(data || []);
    const rec = (data || []).find(r => r.date === today && r.employee_name === user.name);
    setTodayRecord(rec || null);
    if (rec && rec.clock_in && !rec.clock_out) {
      const { data: brk } = await supabase.from("breaks").select("*").eq("attendance_id", rec.id).is("break_end", null).maybeSingle();
      setActiveBreak(brk || null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clockIn = async () => {
    setSaving(true);
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const { data } = await supabase.from("attendance").insert({
      employee_name: user.name, date: localDate,
      clock_in: now.toISOString(), nfc_code: nfcCode
    }).select().single();
    setTodayRecord(data);
    await load();
    setSaving(false);
  };

  const clockOut = async () => {
    if (!todayRecord) return;
    setShowSummaryModal(true);
  };

  const confirmClockOut = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const hours = calcHours(todayRecord.clock_in, now);
    await supabase.from("attendance").update({
      clock_out: now,
      total_hours: hours,
      day_summary: dayNote
    }).eq("id", todayRecord.id);
    setShowSummaryModal(false);
    setDayNote("");
    await load();
    setSaving(false);
  };

  const startBreak = async () => {
    if (!todayRecord) return;
    setSaving(true);
    const { data } = await supabase.from("breaks").insert({
      attendance_id: todayRecord.id,
      break_start: new Date().toISOString()
    }).select().single();
    setActiveBreak(data);
    setSaving(false);
  };

  const endBreak = async () => {
    if (!activeBreak) return;
    setSaving(true);
    const now = new Date().toISOString();
    const mins = ((new Date(now) - new Date(activeBreak.break_start)) / 60000).toFixed(0);
    await supabase.from("breaks").update({
      break_end: now, duration_minutes: mins
    }).eq("id", activeBreak.id);
    setActiveBreak(null);
    setSaving(false);
  };

  const filteredAttendance = isAdmin && filterName !== "All"
    ? attendance.filter(r => r.employee_name === filterName)
    : attendance;

  const statusColor = (rec) => {
    if (!rec.clock_in) return "#6b7280";
    if (!rec.clock_out) return "#F5C518";
    return "#22c55e";
  };

  const statusLabel = (rec) => {
    if (!rec.clock_in) return "Absent";
    if (!rec.clock_out) return "At Work";
    return `${rec.total_hours}h`;
  };

  if (loading) return <Spinner />;

  const isClockedIn = todayRecord?.clock_in && !todayRecord?.clock_out;
  const isClockedOut = todayRecord?.clock_out;

  return (
    <div className="fade-in">
      {/* TODAY'S STATUS - Employee View */}
      {!isAdmin && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: isClockedIn ? "#22c55e" : isClockedOut ? "#8B2FC9" : "#333", boxShadow: isClockedIn ? "0 0 8px #22c55e" : "none" }} />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#ddd", letterSpacing: 2 }}>
                {isClockedIn ? "YOU'RE AT WORK" : isClockedOut ? "DAY COMPLETED" : "NOT CLOCKED IN"}
              </span>
              <span style={{ marginLeft: "auto", color: "#555", fontSize: 13 }}>{fmtDate(today)}</span>
            </div>

            {todayRecord && (
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
                <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "12px 16px", flex: 1, minWidth: 100 }}>
                  <div style={{ color: "#555", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>CLOCK IN</div>
                  <div style={{ color: "#22c55e", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 }}>{fmt(todayRecord.clock_in)}</div>
                </div>
                {todayRecord.clock_out && (
                  <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "12px 16px", flex: 1, minWidth: 100 }}>
                    <div style={{ color: "#555", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>CLOCK OUT</div>
                    <div style={{ color: "#ef4444", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 }}>{fmt(todayRecord.clock_out)}</div>
                  </div>
                )}
                {todayRecord.total_hours && (
                  <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "12px 16px", flex: 1, minWidth: 100 }}>
                    <div style={{ color: "#555", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>TOTAL HOURS</div>
                    <div style={{ color: "#8B2FC9", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 }}>{todayRecord.total_hours}h</div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!todayRecord && (
                <button onClick={clockIn} disabled={saving}
                  style={{ flex: 1, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                  {saving ? "..." : "🟢 CLOCK IN"}
                </button>
              )}
              {isClockedIn && !activeBreak && (
                <>
                  <button onClick={startBreak} disabled={saving}
                    style={{ flex: 1, background: "#F5C51822", color: "#F5C518", border: "1px solid #F5C51844", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                    {saving ? "..." : "☕ START BREAK"}
                  </button>
                  <button onClick={clockOut} disabled={saving}
                    style={{ flex: 1, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                    🔴 CLOCK OUT
                  </button>
                </>
              )}
              {isClockedIn && activeBreak && (
                <button onClick={endBreak} disabled={saving}
                  style={{ flex: 1, background: "linear-gradient(135deg, #F5C518, #d97706)", color: "#111", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                  {saving ? "..." : "▶ END BREAK"}
                </button>
              )}
            </div>

            {activeBreak && (
              <div style={{ marginTop: 12, background: "#F5C51810", border: "1px solid #F5C51830", borderRadius: 10, padding: "10px 14px", color: "#F5C518", fontSize: 13 }}>
                ☕ On break since {fmt(activeBreak.break_start)}
              </div>
            )}

            {todayRecord?.day_summary && (
              <div style={{ marginTop: 12, background: "#8B2FC910", border: "1px solid #8B2FC930", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ color: "#8B2FC9", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>TODAY'S SUMMARY</div>
                <div style={{ color: "#ccc", fontSize: 13 }}>{todayRecord.day_summary}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN STATS */}
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
          {[
            ["Present Today", attendance.filter(r => r.date === today && r.clock_in).length, "#22c55e"],
            ["At Work", attendance.filter(r => r.date === today && r.clock_in && !r.clock_out).length, "#F5C518"],
            ["Left", attendance.filter(r => r.date === today && r.clock_out).length, "#8B2FC9"],
            ["Total Records", attendance.length, "#6b7280"],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: "#141414", border: `1px solid ${c}22`, borderRadius: 14, padding: "18px 16px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: c }}>{v}</div>
              <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* FILTER */}
      {isAdmin && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
          <span style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>FILTER:</span>
          <select value={filterName} onChange={e => setFilterName(e.target.value)} style={{ ...sel, width: "auto" }}>
            <option value="All">All Employees</option>
            {EMPLOYEES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}

      {/* ATTENDANCE RECORDS */}
      <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
        {isAdmin ? "TEAM ATTENDANCE" : "MY ATTENDANCE HISTORY"}
      </div>
      {filteredAttendance.length === 0 ? (
        <div style={{ background: "#0d0d0d", border: "1px dashed #1a1a1a", borderRadius: 12, padding: 32, textAlign: "center", color: "#333" }}>
          No attendance records yet
        </div>
      ) : (
        filteredAttendance.map(rec => (
          <div key={rec.id} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(rec), flexShrink: 0 }} />
            {isAdmin && <Avatar name={rec.employee_name} size={32} />}
            <div style={{ flex: 1, minWidth: 120 }}>
              {isAdmin && <div style={{ fontWeight: 700, color: "#ddd", fontSize: 14 }}>{rec.employee_name}</div>}
              <div style={{ color: "#555", fontSize: 12 }}>{fmtDate(rec.date)}</div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#444", fontSize: 10, letterSpacing: 1 }}>IN</div>
                <div style={{ color: "#22c55e", fontSize: 14, fontFamily: "'Bebas Neue', sans-serif" }}>{fmt(rec.clock_in)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#444", fontSize: 10, letterSpacing: 1 }}>OUT</div>
                <div style={{ color: "#ef4444", fontSize: 14, fontFamily: "'Bebas Neue', sans-serif" }}>{fmt(rec.clock_out)}</div>
              </div>
              <Badge label={statusLabel(rec)} color={statusColor(rec)} />
            </div>
            {rec.day_summary && (
              <div style={{ width: "100%", marginTop: 8, background: "#0d0d0d", borderRadius: 8, padding: "8px 12px", color: "#888", fontSize: 12, lineHeight: 1.5 }}>
                📝 {rec.day_summary}
              </div>
            )}
          </div>
        ))
      )}

      {/* Clock Out + Day Summary Modal */}
      {showSummaryModal && (
        <Modal onClose={() => setShowSummaryModal(false)} width={480}>
          <div style={{ padding: 28 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#f0f0f0", letterSpacing: 2, marginBottom: 8 }}>🔴 CLOCK OUT</h2>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>Before you leave, tell us what you accomplished today.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, letterSpacing: 1 }}>WHAT DID YOU DO TODAY? *</label>
              <textarea value={dayNote} onChange={e => setDayNote(e.target.value)}
                placeholder="e.g. Completed the client logo revisions, attended standup, worked on Instagram posts for NOK campaign..."
                rows={4} style={{ ...inp, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowSummaryModal(false)} style={{ flex: 1, background: "#1e1e1e", color: "#888", border: "1px solid #2a2a2a", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700 }}>Cancel</button>
              <button onClick={confirmClockOut} disabled={!dayNote.trim() || saving}
                style={{ flex: 2, background: !dayNote.trim() ? "#333" : "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
                {saving ? "SAVING..." : "CONFIRM CLOCK OUT ✓"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("tasks");
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const email = data.session.user.email;
        const member = TEAM.find(t => t.name.toLowerCase().replace(/\s/g, "") === email.split("@")[0].toLowerCase().replace(/\s/g, ""));
        setUser({ email, name: member?.name || email.split("@")[0], isAdmin: member?.isAdmin || false, dept: member?.dept || "" });
      }
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setUser(null);
    });
  }, []);

  const loadTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks(data || []);
    const { data: u } = await supabase.from("daily_updates").select("task_id");
    const { data: c } = await supabase.from("comments").select("task_id");
    setUpdates(u || []);
    setComments(c || []);
  };

  useEffect(() => { if (user) loadTasks(); }, [user]);

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const addTask = async (form) => {
    setSaving(true);
    await supabase.from("tasks").insert({ ...form, created_by: user.name });
    await loadTasks();
    setSaving(false);
    setShowNewTask(false);
  };

  const updateTask = async (form) => {
    setSaving(true);
    await supabase.from("tasks").update(form).eq("id", editTask.id);
    await loadTasks();
    setSaving(false);
    setEditTask(null);
    if (selectedTask?.id === editTask.id) setSelectedTask({ ...selectedTask, ...form });
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    await supabase.from("tasks").delete().eq("id", id);
    await loadTasks();
  };

  const updateStatus = async (id, status) => {
    await supabase.from("tasks").update({ status }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if (selectedTask?.id === id) setSelectedTask(prev => ({ ...prev, status }));
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  if (!user) return <><style>{CSS}</style><LoginScreen onLogin={setUser} /></>;

  const isAdmin = user.isAdmin;
  const myTasks = isAdmin ? tasks : tasks.filter(t => t.assignee_name === user.name);
  const visible = myTasks.filter(t => {
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const VIEWS = [
    { key: "tasks", label: "TASKS" },
    { key: "attendance", label: "ATTENDANCE" },
    { key: "summary", label: "WEEKLY SUMMARY" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
        {/* Header */}
        <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "0 24px", display: "flex", alignItems: "center", gap: 12, height: 58, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ background: "#F5C518", borderRadius: 8, padding: "3px 10px", marginRight: 4 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#111", letterSpacing: 2 }}>NOK</span>
          </div>
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              style={{ background: view === v.key ? "#8B2FC9" : "transparent", color: view === v.key ? "#fff" : "#555", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, transition: "all 0.2s" }}>
              {v.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {isAdmin && view === "tasks" && (
              <button onClick={() => setShowNewTask(true)}
                style={{ background: "linear-gradient(135deg, #8B2FC9, #6a1fa0)", color: "#fff", border: "none", borderRadius: 10, padding: "7px 16px", fontSize: 13, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1 }}>
                + ASSIGN TASK
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={user.name} size={28} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#ddd" }}>{user.name.split(" ")[0]}</div>
                <div style={{ fontSize: 10, color: isAdmin ? "#8B2FC9" : "#444" }}>{isAdmin ? "Admin" : "Employee"}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #1e1e1e", borderRadius: 8, padding: "5px 10px", color: "#444", fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={e => e.currentTarget.style.color = "#444"}>
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
          {view === "tasks" && (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
                  style={{ ...inp, flex: 1, minWidth: 180, width: "auto" }} />
                {[["Status", "All", ["All", ...STATUSES], filterStatus, setFilterStatus],
                  ["Priority", "All", ["All", ...PRIORITIES], filterPriority, setFilterPriority]
                ].map(([label, def, opts, val, setter]) => (
                  <select key={label} value={val} onChange={e => setter(e.target.value)} style={{ ...sel, width: "auto" }}>
                    {opts.map(o => <option key={o} value={o} style={{ background: "#1a1a1a" }}>{o === "All" ? `All ${label}` : o}</option>)}
                  </select>
                ))}
                <span style={{ color: "#333", fontSize: 13 }}>{visible.length} task{visible.length !== 1 ? "s" : ""}</span>
              </div>

              {STATUSES.map(status => {
                const col = visible.filter(t => t.status === status);
                if (col.length === 0 && filterStatus !== "All") return null;
                return (
                  <div key={status} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: S_COLOR[status] }} />
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: S_COLOR[status], letterSpacing: 2 }}>{status.toUpperCase()}</span>
                      <span style={{ background: S_COLOR[status] + "18", color: S_COLOR[status], borderRadius: 99, padding: "1px 9px", fontSize: 11, fontWeight: 700 }}>{col.length}</span>
                    </div>
                    {col.length === 0 ? (
                      <div style={{ background: "#0d0d0d", border: "1px dashed #1a1a1a", borderRadius: 12, padding: 20, textAlign: "center", color: "#2a2a2a", fontSize: 13 }}>No {status.toLowerCase()} tasks</div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                        {col.map(t => (
                          <TaskCard key={t.id} task={t} isAdmin={isAdmin}
                            onClick={() => setSelectedTask(t)}
                            onDelete={deleteTask}
                            updatesCount={updates.filter(u => u.task_id === t.id).length}
                            commentsCount={comments.filter(c => c.task_id === t.id).length} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {view === "attendance" && <AttendanceView user={user} isAdmin={isAdmin} />}
          {view === "summary" && <WeeklySummary tasks={isAdmin ? tasks : tasks.filter(t => t.assignee_name === user.name)} />}
        </div>

        {/* Modals */}
        {selectedTask && (
          <TaskDetail task={selectedTask} user={user} isAdmin={isAdmin}
            onClose={() => setSelectedTask(null)}
            onStatusChange={updateStatus}
            onEdit={(t) => { setEditTask(t); }}
            onRefresh={loadTasks} />
        )}
        {showNewTask && <TaskForm onSave={addTask} onClose={() => setShowNewTask(false)} loading={saving} />}
        {editTask && <TaskForm initial={editTask} onSave={updateTask} onClose={() => setEditTask(null)} loading={saving} />}
      </div>
    </>
  );
}
