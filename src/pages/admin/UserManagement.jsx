import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Eye, ShieldCheck, Search, Check, RefreshCw } from "lucide-react";
import Loader from "../../components/common/Loader";
import { getAdminUsers, updateUserRole } from "../../services/adminService";

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("MAKER");
  const [savingRole, setSavingRole] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openRoleModal = (user) => {
    setRoleModalUser(user);
    setSelectedRole(user.role || "MAKER");
  };

  const handleRoleSave = async (e) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setSavingRole(true);
    setFeedback("");
    try {
      await updateUserRole({
        userId: roleModalUser.id || roleModalUser.username,
        role: selectedRole,
      });
      setFeedback(`Role for ${roleModalUser.name} changed to ${selectedRole}.`);
      setRoleModalUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
    } finally {
      setSavingRole(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading User Management..." />;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View user profiles and assign system roles (MAKER, CHECKER, PUBLISHER, ADMIN).
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback("")} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      <div className="glass rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id || user.username} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{user.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        user.role === "ADMIN"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : user.role === "PUBLISHER"
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : user.role === "CHECKER"
                          ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                      <Check size={12} />
                      <span>{user.status || "ACTIVE"}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Recently"}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      to={`/admin/users/${user.id || user.username}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => openRoleModal(user)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                    >
                      <ShieldCheck size={13} />
                      <span>Change Role</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Role Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="glass-strong relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white">
            <h3 className="text-base font-bold text-slate-900 mb-1">Change User Role</h3>
            <p className="text-xs text-slate-500 mb-4">Target User: <strong>{roleModalUser.name}</strong> ({roleModalUser.email})</p>

            <form onSubmit={handleRoleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select New Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {["MAKER", "CHECKER", "PUBLISHER", "ADMIN"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                        selectedRole === r
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
                >
                  {savingRole ? "Saving..." : "Save Role Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
