import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GrievanceForm from '../components/student/GrievanceForm';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LogOut, Plus } from 'lucide-react';

const StudentDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [stats, setStats] = useState({ total: 0, ongoing: 0, resolved: 0 });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'grievances'),
            where('studentId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const grievancesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sort: newest first
            grievancesData.sort((a, b) => {
                if (!a.submittedAt) return 1;
                if (!b.submittedAt) return -1;
                return b.submittedAt.toDate() - a.submittedAt.toDate();
            });

            setGrievances(grievancesData);

            const total = grievancesData.length;
            const ongoing = grievancesData.filter(g => g.status === 'in_progress').length;
            const resolved = grievancesData.filter(g => g.status === 'resolved').length;
            setStats({ total, ongoing, resolved });
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'submitted': { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
            'in_progress': { label: 'Ongoing', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
            'resolved': { label: 'Resolved', color: 'bg-green-100 text-green-800 border border-green-200' }
        };
        const config = statusConfig[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const filteredGrievances = grievances.filter(g => {
        if (filter === 'all') return true;
        if (filter === 'submitted') return g.status === 'submitted';
        if (filter === 'ongoing') return g.status === 'in_progress';
        if (filter === 'resolved') return g.status === 'resolved';
        return true;
    });

    const latestGrievance = grievances.length > 0 ? grievances[0] : null;

    const getStatusMessage = (g) => {
        if (!g) return { title: 'No active issues', message: 'You have no recent grievances.' };
        if (g.status === 'submitted') return {
            title: 'Issue Submitted',
            message: 'Your issue has been submitted and is awaiting review by the warden.',
            icon: '🕒',
            color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };
        if (g.status === 'in_progress') return {
            title: 'Work in Progress',
            message: 'Your issue is currently being worked on by the maintenance team.',
            icon: '🛠️',
            color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
        if (g.status === 'resolved') return {
            title: 'Issue Resolved',
            message: 'Your issue has been marked as resolved. Please verify.',
            icon: '✅',
            color: 'bg-green-50 border-green-200 text-green-800'
        };
        return { title: 'Status Update', message: 'Check your grievance status below.' };
    };

    const statusCard = latestGrievance ? getStatusMessage(latestGrievance) : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{currentUser?.email?.split('@')[0]}</h1>
                                <p className="text-sm text-gray-500">Student Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Raise New Issue
                            </button>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-all"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">

                    {/* What's Happening Card */}
                    {statusCard && (
                        <div className={`mb-8 rounded-xl border p-6 shadow-sm ${statusCard.color}`}>
                            <div className="flex items-start">
                                <span className="text-3xl mr-4">{statusCard.icon}</span>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{statusCard.title}</h3>
                                    <p className="opacity-90">{statusCard.message}</p>
                                    <p className="text-xs opacity-75 mt-2">
                                        Last updated: {latestGrievance?.submittedAt?.toDate().toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1 font-medium">Total Issues</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1 font-medium">Ongoing</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.ongoing}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1 font-medium">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                    </div>

                    {/* Grievance Form Modal/Section */}
                    {showForm && (
                        <div className="mb-6">
                            <GrievanceForm />
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('submitted')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'submitted' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-yellow-50'}`}
                        >
                            Submitted
                        </button>
                        <button
                            onClick={() => setFilter('ongoing')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'}`}
                        >
                            Ongoing
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50'}`}
                        >
                            Resolved
                        </button>
                    </div>

                    {/* Grievances List */}
                    <div className="space-y-4">
                        {filteredGrievances.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                <p className="text-gray-500">No grievances found in this category.</p>
                            </div>
                        ) : (
                            filteredGrievances.map((g, index) => (
                                <div key={g.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-xs font-mono text-gray-400">#{g.id.slice(-6).toUpperCase()}</span>
                                                    {getStatusBadge(g.status)}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 capitalize">{g.title || g.type}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Submitted on {g.submittedAt?.toDate().toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <p className="text-gray-700">{g.description}</p>
                                        </div>

                                        {/* Admin Remarks Section */}
                                        <div className="border-t pt-4 mt-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Admin Updates</p>
                                            {g.adminRemarks ? (
                                                <div className="flex items-start text-sm">
                                                    <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    </div>
                                                    <p className="text-gray-700">{g.adminRemarks}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No updates from admin yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
