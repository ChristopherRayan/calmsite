'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    fetchAboutUs,
    fetchGalleryImages,
    updateAboutUs,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    type AboutUsData,
    type GalleryImage,
} from '@/lib/services';
import { getAccessToken, getStoredUser } from '@/lib/auth';

const MAX_GALLERY_IMAGES = 6;

export default function AdminAboutPage() {
    const [aboutUs, setAboutUs] = useState<AboutUsData | null>(null);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'about' | 'gallery'>('about');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [aboutForm, setAboutForm] = useState({
        title: '',
        subtitle: '',
        description: '',
        quote: '',
        vision_title: '',
        vision_body: '',
        cuisine_title: '',
        cuisine_body: '',
        service_title: '',
        service_body: '',
        years_serving: '',
        menu_items: '',
        rating: '',
    });

    const [newImage, setNewImage] = useState<{ file: File | null; description: string; order: number }>({
        file: null,
        description: '',
        order: 0,
    });

    const [editingImage, setEditingImage] = useState<{ id: number; description: string; order: number } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [aboutData, galleryData] = await Promise.all([fetchAboutUs(), fetchGalleryImages()]);
            setAboutUs(aboutData);
            setGallery(galleryData);
            setAboutForm({
                title: aboutData.title,
                subtitle: aboutData.subtitle,
                description: aboutData.description,
                quote: aboutData.quote,
                vision_title: aboutData.vision_title,
                vision_body: aboutData.vision_body,
                cuisine_title: aboutData.cuisine_title,
                cuisine_body: aboutData.cuisine_body,
                service_title: aboutData.service_title,
                service_body: aboutData.service_body,
                years_serving: aboutData.years_serving,
                menu_items: aboutData.menu_items,
                rating: aboutData.rating,
            });
        } catch (error) {
            console.error('Failed to load data:', error);
            setMessage({ type: 'error', text: 'Failed to load data. Please make sure you are logged in as admin.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAboutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = getAccessToken();
            if (!token) {
                setMessage({ type: 'error', text: 'Authentication required' });
                return;
            }

            const response = await fetch('/api/about-us/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(aboutForm),
            });

            if (!response.ok) {
                throw new Error('Failed to update About Us');
            }

            const updated = await response.json();
            setAboutUs(updated);
            setMessage({ type: 'success', text: 'About Us section updated successfully!' });
        } catch (error) {
            console.error('Failed to save:', error);
            setMessage({ type: 'error', text: 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImage.file) {
            setMessage({ type: 'error', text: 'Please select an image' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const token = getAccessToken();
            if (!token) {
                setMessage({ type: 'error', text: 'Authentication required' });
                return;
            }

            const formData = new FormData();
            formData.append('image', newImage.file);
            formData.append('description', newImage.description);
            formData.append('order', newImage.order.toString());
            formData.append('is_active', 'true');

            const response = await fetch('/api/gallery/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload image');
            }

            setMessage({ type: 'success', text: 'Image uploaded successfully!' });
            setNewImage({ file: null, description: '', order: 0 });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            loadData();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpdate = async (id: number) => {
        if (!editingImage) return;

        setSaving(true);
        setMessage(null);

        try {
            const token = getAccessToken();
            if (!token) {
                setMessage({ type: 'error', text: 'Authentication required' });
                return;
            }

            const formData = new FormData();
            formData.append('description', editingImage.description);
            formData.append('order', editingImage.order.toString());

            const response = await fetch(`/api/gallery/${id}/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to update image');
            }

            setMessage({ type: 'success', text: 'Image updated successfully!' });
            setEditingImage(null);
            loadData();
        } catch (error) {
            console.error('Failed to update:', error);
            setMessage({ type: 'error', text: 'Failed to update image' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        setSaving(true);
        setMessage(null);

        try {
            const token = getAccessToken();
            if (!token) {
                setMessage({ type: 'error', text: 'Authentication required' });
                return;
            }

            const response = await fetch(`/api/gallery/${id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            setMessage({ type: 'success', text: 'Image deleted successfully!' });
            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
            setMessage({ type: 'error', text: 'Failed to delete image' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage About Us & Gallery</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'about'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        About Us Section
                    </button>
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'gallery'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Gallery ({gallery.length}/{MAX_GALLERY_IMAGES})
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* About Us Tab */}
                {activeTab === 'about' && (
                    <form onSubmit={handleAboutSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={aboutForm.title}
                                        onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={aboutForm.subtitle}
                                        onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={aboutForm.description}
                                    onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                                <textarea
                                    value={aboutForm.quote}
                                    onChange={(e) => setAboutForm({ ...aboutForm, quote: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Stats</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Years Serving</label>
                                    <input
                                        type="text"
                                        value={aboutForm.years_serving}
                                        onChange={(e) => setAboutForm({ ...aboutForm, years_serving: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Menu Items</label>
                                    <input
                                        type="text"
                                        value={aboutForm.menu_items}
                                        onChange={(e) => setAboutForm({ ...aboutForm, menu_items: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <input
                                        type="text"
                                        value={aboutForm.rating}
                                        onChange={(e) => setAboutForm({ ...aboutForm, rating: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Cards</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Vision Card</h3>
                                    <input
                                        type="text"
                                        value={aboutForm.vision_title}
                                        onChange={(e) => setAboutForm({ ...aboutForm, vision_title: e.target.value })}
                                        placeholder="Title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                    <textarea
                                        value={aboutForm.vision_body}
                                        onChange={(e) => setAboutForm({ ...aboutForm, vision_body: e.target.value })}
                                        placeholder="Body"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Cuisine Card</h3>
                                    <input
                                        type="text"
                                        value={aboutForm.cuisine_title}
                                        onChange={(e) => setAboutForm({ ...aboutForm, cuisine_title: e.target.value })}
                                        placeholder="Title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                    <textarea
                                        value={aboutForm.cuisine_body}
                                        onChange={(e) => setAboutForm({ ...aboutForm, cuisine_body: e.target.value })}
                                        placeholder="Body"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Service Card</h3>
                                    <input
                                        type="text"
                                        value={aboutForm.service_title}
                                        onChange={(e) => setAboutForm({ ...aboutForm, service_title: e.target.value })}
                                        placeholder="Title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                    <textarea
                                        value={aboutForm.service_body}
                                        onChange={(e) => setAboutForm({ ...aboutForm, service_body: e.target.value })}
                                        placeholder="Body"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-400 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                    <div className="space-y-6">
                        {/* Upload Form */}
                        {gallery.length < MAX_GALLERY_IMAGES && (
                            <form onSubmit={handleImageUpload} className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold mb-4">Add New Image</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setNewImage({ ...newImage, file: e.target.files?.[0] || null })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={newImage.description}
                                            onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                                            placeholder="Description shown on hover"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order (0-5)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={5}
                                            value={newImage.order}
                                            onChange={(e) => setNewImage({ ...newImage, order: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="mt-4 bg-amber-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {saving ? 'Uploading...' : 'Upload Image'}
                                </button>
                            </form>
                        )}

                        {gallery.length >= MAX_GALLERY_IMAGES && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                                Maximum of {MAX_GALLERY_IMAGES} images reached. Please delete an image to add a new one.
                            </div>
                        )}

                        {/* Gallery Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gallery.map((image) => (
                                <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="relative h-48 bg-gray-200">
                                        {image.src ? (
                                            <Image src={image.src} alt={image.description} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        {editingImage?.id === image.id ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    value={editingImage.description}
                                                    onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                                                    placeholder="Description"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={5}
                                                        value={editingImage.order}
                                                        onChange={(e) =>
                                                            setEditingImage({ ...editingImage, order: parseInt(e.target.value) || 0 })
                                                        }
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="Order"
                                                    />
                                                    <button
                                                        onClick={() => handleImageUpdate(image.id!)}
                                                        disabled={saving}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingImage(null)}
                                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-medium text-gray-900">{image.description || 'No description'}</p>
                                                <p className="text-sm text-gray-500 mt-1">Order: {image.order}</p>
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => setEditingImage({ id: image.id!, description: image.description, order: image.order || 0 })}
                                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleImageDelete(image.id!)}
                                                        disabled={saving}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {gallery.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No gallery images yet. Add your first image above.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
