"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const users = [
  {
    id: 1,
    name: "Aditya Gupta",
    mobileNumber: "9876543210",
    role: "admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Riya Sharma",
    mobileNumber: "9123456780",
    role: "user",
    status: "Active",
  },
  {
    id: 3,
    name: "Karan Mehta",
    mobileNumber: "9988776655",
    role: "user",
    status: "Inactive",
  },
];

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 py-6 text-[#1b1f24] sm:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-[#d8dde5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#687386]">Blog Admin</p>
            <h1 className="text-2xl font-semibold">Users</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              href="/create-blog"
            >
              Create Blog
            </Link>
            <button
              className="h-10 rounded-md border border-[#cbd5e1] px-4 text-sm font-medium hover:bg-white"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border border-[#d8dde5] bg-white p-5">
            <p className="text-sm text-[#687386]">Total users</p>
            <strong className="mt-2 block text-3xl">{users.length}</strong>
          </article>
          <article className="rounded-lg border border-[#d8dde5] bg-white p-5">
            <p className="text-sm text-[#687386]">Active users</p>
            <strong className="mt-2 block text-3xl">
              {users.filter((user) => user.status === "Active").length}
            </strong>
          </article>
          <article className="rounded-lg border border-[#d8dde5] bg-white p-5">
            <p className="text-sm text-[#687386]">Admins</p>
            <strong className="mt-2 block text-3xl">
              {users.filter((user) => user.role === "admin").length}
            </strong>
          </article>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#d8dde5] bg-white">
          <div className="border-b border-[#e4e7ec] px-5 py-4">
            <h2 className="text-lg font-semibold">All users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f8fafc] text-[#687386]">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Mobile number</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e7ec]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 font-medium">{user.name}</td>
                    <td className="px-5 py-4 text-[#475467]">{user.mobileNumber}</td>
                    <td className="px-5 py-4 capitalize text-[#475467]">{user.role}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-xs font-medium text-[#027a48]">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
