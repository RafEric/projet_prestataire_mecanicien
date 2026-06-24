import { useEffect, useState } from "react";
import { usersApi } from "../../api/users";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import type { UserAdmin } from "../../types/user";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.list().then((d) => setUsers(d.results)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleActive = async (user: UserAdmin) => {
    const updated = await usersApi.update(user.id, { is_active: !user.is_active });
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <PageHeader title="Gestion des utilisateurs" subtitle={`${users.length} utilisateurs`} />
      {users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" />
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><StatusBadge status={u.role} type="role" /></td>
                  <td>{u.is_active ? "Actif" : "Inactif"}</td>
                  <td>
                    <button type="button" className="btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                      {u.is_active ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}