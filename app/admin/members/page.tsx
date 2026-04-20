import { createClient } from "@/lib/supabase/server";

export default async function AdminMembersPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("pawpalace_profiles")
    .select("id, email, full_name, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">Members</h1>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">Name</th>
              <th className="text-left px-6 py-4 font-medium">Email</th>
              <th className="text-left px-6 py-4 font-medium">Role</th>
              <th className="text-left px-6 py-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{member.full_name ?? "—"}</td>
                <td className="px-6 py-4 text-slate-600">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.is_admin ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {member.is_admin ? "Admin" : "Member"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(member.created_at).toLocaleDateString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
