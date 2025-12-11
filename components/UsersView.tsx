
import React, { useEffect, useState } from 'react';
import { User, Role } from '../types';
import { db } from '../services/database';
import { Plus, Trash2, User as UserIcon, ShieldAlert } from 'lucide-react';

const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
     name: '', email: '', role: 'user', password: '123'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await db.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const u: User = {
       id: Math.random().toString(36).substr(2, 9),
       name: newUser.name,
       email: newUser.email,
       role: newUser.role as Role,
       password: newUser.password || '123',
       avatar: newUser.name.substring(0,2).toUpperCase()
    };
    
    await db.addUser(u);
    setShowModal(false);
    loadUsers();
    setNewUser({ name: '', email: '', role: 'user', password: '123' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this user access?')) {
       await db.deleteUser(id);
       loadUsers();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Users...</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500">Manage system access and roles</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {users.map(user => (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                  user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                  user.role === 'manager' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
               }`}>
                  {user.avatar}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                     </div>
                     {user.id !== 'u1' && (
                        <button onClick={() => handleDelete(user.id)} className="text-slate-300 hover:text-rose-500">
                           <Trash2 size={16} />
                        </button>
                     )}
                  </div>
                  <div className="mt-3 flex gap-2">
                     <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${
                        user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                     }`}>
                        {user.role}
                     </span>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {showModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4">Add New User</h3>
               <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                     <input required className="w-full border p-2 rounded" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                     <input required type="email" className="w-full border p-2 rounded" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                     <select className="w-full border p-2 rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                     <input required type="password" className="w-full border p-2 rounded" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                     <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">Create</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default UsersView;
