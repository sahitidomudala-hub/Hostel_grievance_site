import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const GrievanceForm = () => {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('general');
    const [roomNumber, setRoomNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await addDoc(collection(db, 'grievances'), {
                studentId: currentUser.uid,
                studentEmail: currentUser.email,
                sapId: currentUser.email?.split('@')[0],
                title,
                description,
                type,
                roomNumber,
                date,
                status: 'submitted',
                submittedAt: serverTimestamp(),
                adminRemarks: '',
                // Repair tracking fields
                lastRepairedAt: null, // Will be set when status changes to 'resolved'
                repairCount: 0 // Incremented each time issue is marked as resolved
            });
            setMessage('Grievance submitted successfully!');
            setTitle('');
            setDescription('');
            setType('general');
            setRoomNumber('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error("Error adding document: ", error);
            setMessage('Error submitting grievance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Raise a New Grievance</h3>
            {message && <div className={`mb-4 p-2 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    >
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="housekeeping">Housekeeping</option>
                        <option value="internet">Internet/Wi-Fi</option>
                        <option value="food">Food/Mess</option>
                        <option value="general">General</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="Brief title of the issue"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Room Number</label>
                    <input
                        type="text"
                        required
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="e.g., A-101"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                        placeholder="Detailed description..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Grievance'}
                </button>
            </form>
        </div>
    );
};

export default GrievanceForm;
