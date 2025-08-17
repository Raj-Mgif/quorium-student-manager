import React, { useEffect, useMemo, useState } from "react";

// Quorium Student Manager — Frontend Option (React + Tailwind)
// Features:
// - Dashboard (stats + welcome)
// - Students List (search, filter by course & status, sort, paginate)
// - Add Student (in-memory add, immediate UI update)
// Data Source: https://dummyjson.com/users (transformed into students)

const COURSES = [
  "B.Tech CSE",
  "BBA",
  "MBA",
  "B.Com",
  "MCA",
  "B.Sc IT",
  "BA Economics",
  "BCA",
];

const STATUSES = ["Active", "Inactive", "On Hold", "Graduated"];

function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("https://dummyjson.com/users?limit=100");
        const data = await res.json();
        const list = (data.users || []).map((u, idx) => {
          const id = idx + 1;
          const course = COURSES[(u.id + 3) % COURSES.length];
          const status = STATUSES[(u.id + 1) % STATUSES.length];
          const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
          return {
            id,
            studentId: `QSTU-${1000 + id}`,
            name,
            email: u.email || `${u.username}@example.com`,
            phone: u.phone || "",
            course,
            status,
            avatar: u.image,
            city: u?.address?.city || u?.company?.address?.city || "",
          };
        });
        setStudents(list);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch students. Please retry.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { students, setStudents, loading, error };
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl bg-white shadow-md p-5 border border-slate-200">
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function TopBar({ onRoute, route }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">
          Q
        </div>
        <div className="font-semibold">Quorium Student Manager</div>
        <nav className="ml-auto flex gap-2">
          {[
            ["dashboard", "Dashboard"],
            ["students", "Students"],
            ["add", "Add Student"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => onRoute(key)}
              className={classNames(
                "px-3 py-1.5 rounded-xl text-sm",
                route === key ? "bg-slate-900 text-white" : "hover:bg-slate-100"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Dashboard({ students }) {
  const total = students.length;
  const active = students.filter((s) => s.status === "Active").length;
  const onHold = students.filter((s) => s.status === "On Hold").length;
  const graduated = students.filter((s) => s.status === "Graduated").length;

  const welcomeName = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-4">
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-semibold">
          {welcomeName}, Quorium Team 👋
        </h1>
        <p className="text-slate-200 mt-2 max-w-2xl">
          Welcome to the Student Management Dashboard. Track student metrics and
          manage records with a clean, fast UI.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Students" value={total} />
        <StatCard label="Active" value={active} />
        <StatCard label="On Hold" value={onHold} />
        <StatCard label="Graduated" value={graduated} />
      </section>

      <section className="mt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Quick Tips</h2>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-600 space-y-1">
            <li>
              Use the <strong>Students</strong> tab to search and filter
              records.
            </li>
            <li>
              Add a new student via <strong>Add Student</strong>. The list
              updates instantly.
            </li>
            <li>
              Data initializes from DummyJSON users and is stored in-memory for
              this demo.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-slate-100 text-slate-700",
    "On Hold": "bg-amber-100 text-amber-800",
    Graduated: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={classNames(
        "px-2 py-1 rounded-full text-xs font-medium",
        map[status] || "bg-slate-100"
      )}
    >
      {status}
    </span>
  );
}

function StudentsList({ students, onRefresh }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = students.filter((s) =>
      [s.name, s.email, s.phone, s.studentId, s.course, s.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
    if (course !== "All") out = out.filter((s) => s.course === course);
    if (status !== "All") out = out.filter((s) => s.status === status);
    out.sort((a, b) => {
      const va = (a[sortKey] ?? "").toString().toLowerCase();
      const vb = (b[sortKey] ?? "").toString().toLowerCase();
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return out;
  }, [students, query, course, status, sortKey, asc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    // reset to first page whenever filters/search change
    setPage(1);
  }, [query, course, status]);

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Search name, email, phone, ID, course, city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option>All</option>
            {COURSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="rounded-xl px-3 py-2 bg-slate-900 text-white"
            title="Re-fetch from DummyJSON"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 border-b">
                {[
                  ["name", "Student"],
                  ["studentId", "ID"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["course", "Course"],
                  ["status", "Status"],
                  ["city", "City"],
                ].map(([key, label]) => (
                  <th key={key} className="py-3 pr-4">
                    <button
                      className="flex items-center gap-1 hover:underline"
                      onClick={() => {
                        if (sortKey === key) setAsc(!asc);
                        else {
                          setSortKey(key);
                          setAsc(true);
                        }
                      }}
                    >
                      {label}
                      {sortKey === key && <span>{asc ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-9 h-9 rounded-full object-cover border"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                      <div className="">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">{s.studentId}</td>
                  <td className="py-3 pr-4">{s.email}</td>
                  <td className="py-3 pr-4">{s.phone}</td>
                  <td className="py-3 pr-4">{s.course}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3 pr-4">{s.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            Showing {pageData.length} of {filtered.length} students
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg border"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-lg border"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function AddStudent({ onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [city, setCity] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");
    const id = Date.now();
    const student = {
      id,
      studentId: `QSTU-${id.toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      course,
      status,
      city: city.trim(),
    };
    onAdd(student);
    setName("");
    setEmail("");
    setPhone("");
    setCourse(COURSES[0]);
    setStatus(STATUSES[0]);
    setCity("");
  }

  return (
    <main className="mx-auto max-w-2xl p-4">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h2 className="text-xl font-semibold">Add New Student</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Full Name*</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Raj Sharma"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Phone</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 00000"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">City</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New Delhi"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Course</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              {COURSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Status</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-xl px-4 py-2 bg-slate-900 text-white"
          >
            Add Student
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-slate-600">
        <p>
          Note: This demo keeps data in memory only. Refreshing the page resets
          to the initial dataset fetched from DummyJSON.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  const { students, setStudents, loading, error } = useStudents();
  const [route, setRoute] = useState("dashboard");

  async function refresh() {
    try {
      const res = await fetch("https://dummyjson.com/users?limit=100");
      const data = await res.json();
      const list = (data.users || []).map((u, idx) => {
        const id = idx + 1;
        const course = COURSES[(u.id + 3) % COURSES.length];
        const status = STATUSES[(u.id + 1) % STATUSES.length];
        const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
        return {
          id,
          studentId: `QSTU-${1000 + id}`,
          name,
          email: u.email || `${u.username}@example.com`,
          phone: u.phone || "",
          course,
          status,
          avatar: u.image,
          city: u?.address?.city || u?.company?.address?.city || "",
        };
      });
      setStudents(list);
    } catch (e) {
      alert("Refresh failed. Check console.");
      console.error(e);
    }
  }

  function handleAdd(student) {
    setStudents((prev) => [student, ...prev]);
    setRoute("students");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar route={route} onRoute={setRoute} />
      {loading && (
        <div className="mx-auto max-w-6xl p-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
            Loading students…
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="mx-auto max-w-6xl p-6">
          <div className="rounded-2xl bg-red-50 p-6 border border-red-200 text-red-800 shadow-sm">
            {error}
          </div>
        </div>
      )}
      {!loading && !error && route === "dashboard" && (
        <Dashboard students={students} />
      )}
      {!loading && !error && route === "students" && (
        <StudentsList students={students} onRefresh={refresh} />
      )}
      {!loading && !error && route === "add" && (
        <AddStudent onAdd={handleAdd} />
      )}

      <footer className="mx-auto max-w-6xl p-6 text-xs text-slate-500">
        <div className="border-t pt-4">
          Built for Quorium Consulting • Frontend Option • React + Tailwind •{" "}
          {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
