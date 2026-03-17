'use client';

import { useState, useEffect } from 'react';
import { fetchAllReservations } from '@/lib/services';
import type { Reservation } from '@/lib/types';
import { getAccessToken } from '@/lib/auth';

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const token = getAccessToken();
            if (!token) {
                setError('Please log in as admin to view reservations.');
                setLoading(false);
                return;
            }
            const data = await fetchAllReservations();
            setReservations(data);
        } catch (err) {
            console.error('Failed to load reservations:', err);
            setError('Failed to load reservations. Please make sure you are logged in as admin.');
        } finally {
            setLoading(false);
        }
    };

    const filteredReservations = reservations.filter((res) => {
        if (filter === 'all') return true;
        return res.status === filter;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr: string) => {
        // Handle time format from API (could be HH:MM:SS or HH:MM)
        return timeStr ? timeStr.substring(0, 5) : '';
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Reservations</h1>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading reservations...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Reservations</h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
                        <p className="text-gray-500 mt-1">
                            {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''}
                            {filter !== 'all' && ` (${filter})`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredReservations.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 text-lg mb-2">No reservations found</div>
                        <p className="text-gray-500">
                            {filter !== 'all' ? `No ${filter} reservations yet.` : 'Reservations from guests will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Guest
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Party Size
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredReservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-medium text-amber-600">
                                                {reservation.confirmation_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{reservation.name}</div>
                                            <div className="text-sm text-gray-500">{reservation.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900">
                                                {formatDate(reservation.date)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatTime(reservation.time_slot)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-900">
                                                {reservation.party_size} guest{reservation.party_size !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(reservation.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{reservation.phone}</div>
                                            {reservation.special_requests && (
                                                <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={reservation.special_requests}>
                                                    {reservation.special_requests}
                                                </div>
                                            )}
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
