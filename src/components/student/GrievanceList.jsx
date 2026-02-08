import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const GrievanceList = () => {
    const { currentUser } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'grievances'),
            where('studentId', '==', currentUser.uid),
            orderBy('submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const grievancesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGrievances(grievancesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching grievances: ", error); // Note: verify index exists for composite queries
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'resolved': return <CheckCircle className="text-green-500" />;
            case 'in_progress': return <Clock className="text-yellow-500" />;
            default: return <AlertCircle className="text-red-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-red-100 text-red-800';
        }
    };

    if (loading) return <div>Loading your grievances...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">My Grievances</h3>
            {grievances.length === 0 ? (
                <p className="text-gray-500">No grievances submitted yet.</p>
            ) : (
                grievances.map((grievance) => (
                    <div key={grievance.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-gray-900">{grievance.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{grievance.type} • {grievance.submittedAt?.toDate().toLocaleDateString()}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                                {getStatusIcon(grievance.status)}
                                <span className="ml-1 capitalize">{grievance.status.replace('_', ' ')}</span>
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-700">{grievance.description}</p>
                        {grievance.adminRemarks && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                <span className="font-semibold text-gray-900">Admin Remarks:</span> {grievance.adminRemarks}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default GrievanceList;
