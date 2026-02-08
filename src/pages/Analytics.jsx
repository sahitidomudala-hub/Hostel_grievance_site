import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowLeft, LogOut, FileText, CheckCircle, Clock, Timer } from 'lucide-react';

const Analytics = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [grievances, setGrievances] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        avgResolutionTime: 0,
        byCategory: {},
        byStatus: { submitted: 0, in_progress: 0, resolved: 0 },
        monthlyTrend: [],
        repairsByCategory: {},
        highFrequencyIssues: 0
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'grievances'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGrievances(data);

            // Calculate statistics
            const total = data.length;
            const resolved = data.filter(g => g.status === 'resolved').length;
            const pending = data.filter(g => g.status === 'submitted').length;
            const inProgress = data.filter(g => g.status === 'in_progress').length;

            // Calculate average resolution time (in days)
            const resolvedGrievances = data.filter(g => g.status === 'resolved' && g.submittedAt && g.resolvedAt);
            let avgResolutionTime = 0;
            if (resolvedGrievances.length > 0) {
                const totalTime = resolvedGrievances.reduce((sum, g) => {
                    const submitted = g.submittedAt.toDate();
                    const resolved = g.resolvedAt.toDate();
                    const diffDays = (resolved - submitted) / (1000 * 60 * 60 * 24);
                    return sum + diffDays;
                }, 0);
                avgResolutionTime = (totalTime / resolvedGrievances.length).toFixed(1);
            }

            // Group by category
            const byCategory = data.reduce((acc, curr) => {
                const type = curr.type || 'general';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            // Group by status
            const byStatus = {
                submitted: pending,
                in_progress: inProgress,
                resolved: resolved
            };

            // Calculate monthly trend for last 6 months
            const now = new Date();
            const monthlyTrend = [];
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = monthDate.toLocaleString('default', { month: 'short' });
                const year = monthDate.getFullYear();

                const count = data.filter(g => {
                    if (!g.submittedAt) return false;
                    const submittedDate = g.submittedAt.toDate();
                    return submittedDate.getMonth() === monthDate.getMonth() &&
                        submittedDate.getFullYear() === monthDate.getFullYear();
                }).length;

                monthlyTrend.push({ month: `${monthName} ${year}`, count });
            }

            // Calculate repair frequency analytics
            // Total repairs by category (sum of repairCount for each category)
            const repairsByCategory = data.reduce((acc, curr) => {
                const type = curr.type || 'general';
                const repairs = curr.repairCount || 0;
                acc[type] = (acc[type] || 0) + repairs;
                return acc;
            }, {});

            // Identify high-frequency repair issues (repairCount > 1)
            const highFrequencyIssues = data.filter(g => (g.repairCount || 0) > 1).length;

            setStats({
                total,
                resolved,
                pending,
                avgResolutionTime,
                byCategory,
                byStatus,
                monthlyTrend,
                repairsByCategory,
                highFrequencyIssues
            });
        });

        return () => unsubscribe();
    }, []);

    // Pie chart calculation for categories
    const categoryData = Object.entries(stats.byCategory);
    const categoryColors = {
        plumbing: '#6366f1',
        electrical: '#ec4899',
        housekeeping: '#f59e0b',
        internet: '#10b981',
        food: '#8b5cf6',
        general: '#6b7280'
    };

    // Bar chart for status
    const maxStatusCount = Math.max(...Object.values(stats.byStatus), 1);

    // Performance Logic
    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    let performanceLabel = 'Needs Improvement';
    let performanceColor = 'text-orange-600';
    if (resolutionRate >= 90) {
        performanceLabel = 'Excellent';
        performanceColor = 'text-green-600';
    } else if (resolutionRate >= 75) {
        performanceLabel = 'Good';
        performanceColor = 'text-blue-600';
    } else if (resolutionRate >= 50) {
        performanceLabel = 'Average';
        performanceColor = 'text-yellow-600';
    }

    // Efficiency Score (Inverse of resolution time, max 10)
    let efficiencyScore = 10;
    if (stats.avgResolutionTime > 0) {
        efficiencyScore = Math.max(0, 10 - stats.avgResolutionTime).toFixed(1);
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Analytics Overview</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Dashboard
                            </button>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Performance Header */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Grievance Resolution Metrics</h2>
                            <p className="text-gray-500 text-sm">Overview of current hostel administration performance.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <span className="text-sm font-medium text-gray-600 mr-2">Efficiency Rating:</span>
                            <span className={`text-sm font-bold ${performanceColor}`}>{performanceLabel}</span>
                        </div>
                    </div>

                    {/* Resolution Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-gray-600">Overall Resolution Rate</span>
                            <span className="text-gray-900">{resolutionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${resolutionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Efficiency Score */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Efficiency Score</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{efficiencyScore}<span className="text-lg text-gray-400 font-normal">/10</span></h3>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-md text-blue-600">
                                <Timer className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Based on avg. resolution time</p>
                    </div>

                    {/* Pending Issues */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                                <h3 className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</h3>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-md text-orange-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">{stats.in_progress} currently in progress</p>
                    </div>

                    {/* Resolved Issues */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Resolved Issues</p>
                                <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</h3>
                            </div>
                            <div className="bg-green-50 p-2 rounded-md text-green-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Successfully closed tickets</p>
                    </div>

                    {/* Avg Time */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Resolution Time</p>
                                <h3 className="text-3xl font-bold text-indigo-600 mt-2">{stats.avgResolutionTime} <span className="text-lg text-gray-400 font-normal">days</span></h3>
                            </div>
                            <div className="bg-indigo-50 p-2 rounded-md text-indigo-600">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Average turnaround time</p>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                            Issues by Category
                        </h3>
                        <div className="flex justify-center py-4">
                            <svg width="240" height="240" viewBox="0 0 300 300" className="transform -rotate-90">
                                {categoryData.length > 0 ? (
                                    categoryData.map(([category, count], index) => {
                                        const total = Object.values(stats.byCategory).reduce((a, b) => a + b, 0);
                                        const percentage = (count / total) * 100;
                                        const angle = (percentage / 100) * 360;

                                        let startAngle = 0;
                                        for (let i = 0; i < index; i++) {
                                            const prevCount = categoryData[i][1];
                                            startAngle += ((prevCount / total) * 360);
                                        }

                                        const startRad = (startAngle) * (Math.PI / 180);
                                        const endRad = (startAngle + angle) * (Math.PI / 180);

                                        const x1 = 150 + 100 * Math.cos(startRad);
                                        const y1 = 150 + 100 * Math.sin(startRad);
                                        const x2 = 150 + 100 * Math.cos(endRad);
                                        const y2 = 150 + 100 * Math.sin(endRad);

                                        const largeArc = angle > 180 ? 1 : 0;

                                        const d = categoryData.length === 1
                                            ? `M 150 150 m -100, 0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0`
                                            : `M 150 150 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                                        return (
                                            <path
                                                key={category}
                                                d={d}
                                                fill={categoryColors[category] || '#9ca3af'}
                                                className="hover:opacity-90 transition-opacity cursor-pointer"
                                                stroke="white"
                                                strokeWidth="2"
                                            />
                                        );
                                    })
                                ) : (
                                    <circle cx="150" cy="150" r="100" fill="#f3f4f6" />
                                )}
                            </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {categoryData.map(([category, count]) => (
                                <div key={category} className="flex items-center">
                                    <span
                                        className="w-3 h-3 rounded-full mr-2 shadow-sm"
                                        style={{ backgroundColor: categoryColors[category] || '#9ca3af' }}
                                    ></span>
                                    <span className="text-sm text-gray-700 capitalize flex justify-between w-full">
                                        {category} <span className="font-semibold text-gray-900">{count}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                            Status Distribution
                        </h3>
                        <div className="space-y-8 my-auto">
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="text-gray-700">New Issues</span>
                                    <span className="text-gray-900">{stats.byStatus.submitted}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-sm h-4">
                                    <div
                                        className="bg-blue-500 h-4 rounded-sm transition-all duration-500"
                                        style={{ width: `${(stats.byStatus.submitted / maxStatusCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="text-gray-700">In Progress</span>
                                    <span className="text-gray-900">{stats.byStatus.in_progress}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-sm h-4">
                                    <div
                                        className="bg-orange-400 h-4 rounded-sm transition-all duration-500"
                                        style={{ width: `${(stats.byStatus.in_progress / maxStatusCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="text-gray-700">Resolved</span>
                                    <span className="text-gray-900">{stats.byStatus.resolved}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-sm h-4">
                                    <div
                                        className="bg-green-500 h-4 rounded-sm transition-all duration-500"
                                        style={{ width: `${(stats.byStatus.resolved / maxStatusCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Submission Trend</h3>
                    <p className="text-sm text-gray-500 mb-6">Volume of grievances reported over the last 6 months.</p>
                    <div className="h-64 relative">
                        {stats.monthlyTrend.length > 0 && (
                            <svg width="100%" height="100%" viewBox="0 0 800 250" preserveAspectRatio="xMidYMid meet">
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line
                                        key={i}
                                        x1="60"
                                        y1={50 + i * 40}
                                        x2="750"
                                        y2={50 + i * 40}
                                        stroke="#f3f4f6"
                                        strokeWidth="1"
                                    />
                                ))}

                                {/* Y-axis labels */}
                                {(() => {
                                    const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count), 1);
                                    const step = Math.ceil(maxCount / 4);
                                    return [0, 1, 2, 3, 4].map(i => (
                                        <text
                                            key={i}
                                            x="45"
                                            y={210 - i * 40}
                                            fontSize="11"
                                            fill="#9ca3af"
                                            textAnchor="end"
                                            alignmentBaseline="middle"
                                        >
                                            {i * step}
                                        </text>
                                    ));
                                })()}

                                {/* Line chart */}
                                {(() => {
                                    const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count), 1);
                                    const points = stats.monthlyTrend.map((item, index) => {
                                        const x = 60 + (index * (690 / (stats.monthlyTrend.length - 1)));
                                        const y = 210 - ((item.count / maxCount) * 160);
                                        return `${x},${y}`;
                                    }).join(' ');

                                    return (
                                        <>
                                            <polyline
                                                points={points}
                                                fill="none"
                                                stroke="#4f46e5"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            {stats.monthlyTrend.map((item, index) => {
                                                const x = 60 + (index * (690 / (stats.monthlyTrend.length - 1)));
                                                const y = 210 - ((item.count / maxCount) * 160);
                                                return (
                                                    <g key={index}>
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="4"
                                                            fill="white"
                                                            stroke="#4f46e5"
                                                            strokeWidth="2"
                                                        />
                                                        <text
                                                            x={x}
                                                            y={y - 15}
                                                            fontSize="11"
                                                            fill="#374151"
                                                            textAnchor="middle"
                                                            fontWeight="500"
                                                        >
                                                            {item.count}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </>
                                    );
                                })()}

                                {/* X-axis labels */}
                                {stats.monthlyTrend.map((item, index) => {
                                    const x = 60 + (index * (690 / (stats.monthlyTrend.length - 1)));
                                    return (
                                        <text
                                            key={index}
                                            x={x}
                                            y={235}
                                            fontSize="11"
                                            fill="#6b7280"
                                            textAnchor="middle"
                                        >
                                            {item.month}
                                        </text>
                                    );
                                })}
                            </svg>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
