'use client';

import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  is_beta_tester: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface UserWithEmail extends Profile {
  email?: string;
}

export default function BetaTestersPage() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/beta-testers');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleBetaTester = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdating(userId);
      const res = await fetch('/api/beta-testers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBetaTester: !currentStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_beta_tester: !currentStatus } : u
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const addUser = async () => {
    if (!newUserId.trim()) {
      alert('Please enter a user ID');
      return;
    }

    try {
      setAdding(true);
      const res = await fetch('/api/beta-testers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUserId.trim(), isBetaTester: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add user');
      }

      // Refresh the list
      await fetchUsers();
      setNewUserId('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beta Testers</h1>
        <p className="text-gray-600 mt-1">
          Manage users who have access to Pro features for testing
        </p>
      </div>

      {/* Add New User */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Beta Tester</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="Enter Supabase User ID (UUID)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            onClick={addUser}
            disabled={adding}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding...' : 'Add as Beta Tester'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Find user IDs in Supabase Dashboard → Authentication → Users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No users found. Add a user above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Beta Tester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {user.id}
                      </div>
                      {user.email && (
                        <div className="text-sm text-gray-500">{user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleBetaTester(user.id, user.is_beta_tester)}
                        disabled={updating === user.id}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                          user.is_beta_tester ? 'bg-teal-500' : 'bg-gray-200'
                        } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user.is_beta_tester ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`ml-3 text-sm ${user.is_beta_tester ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                        {user.is_beta_tester ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
