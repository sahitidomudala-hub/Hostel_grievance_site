import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LogOut, BarChart, List, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [grievances, setGrievances] = useState([]);
    const [filter, setFilter] = useState('submitted');
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, in_progress: 0 });
    const [selectedGrievance, setSelectedGrievance] = useState(null); // For modal or detail view
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'grievances'), orderBy('submittedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGrievances(data);

            // Compute dashboard metrics
            const total = data.length;
            const resolved = data.filter(g => g.status === 'resolved').length;
            const pending = data.filter(g => g.status === 'submitted').length;
            const in_progress = data.filter(g => g.status === 'in_progress').length;

            const byCategory = data.reduce((acc, curr) => {
                const type = curr.type || 'general';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            setStats({ total, resolved, pending, in_progress, byCategory });
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const grievanceRef = doc(db, 'grievances', id);
            const updateData = { status: newStatus };

            // If resolving, update repair metrics atomically
            if (newStatus === 'resolved') {
                updateData.resolvedAt = serverTimestamp();
                updateData.lastRepairedAt = serverTimestamp();
                updateData.repairCount = increment(1);
            }

            await updateDoc(grievanceRef, updateData);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleRemarksUpdate = async (id) => {
        if (!remarks) return;
        try {
            const grievanceRef = doc(db, 'grievances', id);
            await updateDoc(grievanceRef, {
                adminRemarks: remarks
            });
            setRemarks('');
            setSelectedGrievance(null);
        } catch (error) {
            console.error("Error adding remarks:", error);
        }
    };

    const filteredGrievances = grievances.filter(g => {
        if (filter === 'all') return true;
        return g.status === filter;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-sm text-gray-500">Administrator</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/admin/analytics')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <BarChart className="h-4 w-4 mr-2" />
                                Analytics
                            </button>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Analytics Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-medium">Total Grievances</h3>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                        <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
                        <p className="text-2xl font-bold">{stats.in_progress}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
                        <p className="text-2xl font-bold">{stats.resolved}</p>
                    </div>
                </div>

                {/* Category Analytics */}
                <div className="bg-white p-4 rounded-lg shadow mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Grievances by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(stats.byCategory || {}).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="capitalize text-gray-700">{category}</span>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters and List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Issue Management</h3>
                        <p className="text-sm text-gray-500 mb-4">Monitor and manage all hostel grievances</p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('submitted')}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'submitted' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                            >
                                New Issues ({stats.pending})
                            </button>
                            <button
                                onClick={() => setFilter('in_progress')}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'in_progress' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                            >
                                Ongoing Issues ({stats.in_progress})
                            </button>
                            <button
                                onClick={() => setFilter('resolved')}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                            >
                                Resolved Issues ({stats.resolved})
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student / Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredGrievances.map((g) => (
                                    <tr key={g.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{g.title}</div>
                                            <div className="text-sm text-gray-500 capitalize">{g.type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">SAP ID: {g.sapId || g.studentEmail?.split('@')[0]}</div>
                                            <div className="text-sm text-gray-500">Room: {g.roomNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{g.submittedAt ? g.submittedAt.toDate().toLocaleDateString() : 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                g.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                                {g.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <select
                                                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                value={g.status}
                                                onChange={(e) => handleStatusUpdate(g.id, e.target.value)}
                                            >
                                                <option value="submitted">Submitted</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                            <button
                                                className="ml-2 text-indigo-600 hover:text-indigo-900"
                                                onClick={() => {
                                                    setSelectedGrievance(g);
                                                    setRemarks(g.adminRemarks || '');
                                                }}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Detail Modal (Simple Implementation) */}
            {selectedGrievance && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-lg font-bold mb-2">{selectedGrievance.title}</h3>
                        <p className="text-gray-600 mb-4">{selectedGrievance.description}</p>

                        {/* Repair History Information */}
                        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Repair History</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Repair Count:</span>
                                    <span className="ml-2 font-semibold">
                                        {selectedGrievance.repairCount || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Last Repaired:</span>
                                    <span className="ml-2 font-semibold">
                                        {selectedGrievance.lastRepairedAt
                                            ? new Date(selectedGrievance.lastRepairedAt.toDate()).toLocaleDateString()
                                            : 'Not yet repaired'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Add Admin Remarks</label>
                            <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                rows="3"
                                defaultValue={selectedGrievance.adminRemarks || ''}
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setSelectedGrievance(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleRemarksUpdate(selectedGrievance.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Remarks
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
