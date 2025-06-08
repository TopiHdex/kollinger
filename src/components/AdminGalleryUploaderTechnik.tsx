import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";
import "./AdminGalleryUploader.scss";
import { db, storage, type GalleryItem } from '../lib/firebaseClient';


const ALL_POSITIONS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "cA", "cB", "cC"];

export default function AdminGalleryUploader() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [columnSpan, setColumnSpan] = useState(1);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState("");
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "gallery-technik"), (snapshot) => {
            const items: GalleryItem[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as GalleryItem));

            // Sort by position for consistent layout
            const POSITION_ORDER = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "cA", "cB", "cC"];
            const sorted = POSITION_ORDER
                .map((pos) => items.find((item) => item.position === pos))
                .filter(Boolean) as GalleryItem[];

            setGalleryItems(sorted);
        });

        return () => unsubscribe(); // Clean up on unmount
    }, []);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setColumnSpan(1);
        setUploadFile(null);
        setPreviewImage("");
        setSelectedPosition(null);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPosition) {
            alert('Select a position!');
            return;
        }

        setLoading(true);
        let imageUrl = previewImage;

        try {
            // If a new file is selected, upload it
            if (uploadFile) {
                const storageRef = ref(storage, `gallery-technik/${uploadFile.name}`);
                await uploadBytes(storageRef, uploadFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            if (editingItem) {
                const itemRef = doc(db, "gallery-technik", editingItem.id);

                // If a new image was uploaded, delete the old one
                if (uploadFile && editingItem.imageUrl) {
                    const oldImageRef = ref(storage, editingItem.imageUrl);
                    try {
                        await deleteObject(oldImageRef);
                    } catch (err) {
                        console.warn("Old image could not be deleted (already gone?)", err);
                    }
                }

                // Update the Firestore document
                await updateDoc(itemRef, {
                    title,
                    description,
                    span: columnSpan,
                    imageUrl,
                });

                alert("Image updated!");
            } else {
                // ADD new item
                await addDoc(collection(db, "gallery-technik"), {
                    title,
                    description,
                    span: columnSpan,
                    imageUrl,
                    position: selectedPosition,
                    highlighted: false,
                });

                alert("Image uploaded!");
            }

            resetForm();
        } catch (err) {
            console.error("Update error", err);
            alert("Failed to update image.");
        } finally {
            setLoading(false);
        }
    };


    const toggleHighlight = async (item: GalleryItem) => {
        const currentHighlights = galleryItems.filter(i => i.isHighlight);

        if (!item.isHighlight && currentHighlights.length >= 6) {
            alert("You can only highlight up to 6 images.");
            return;
        }

        const itemRef = doc(db, "gallery-technik", item.id);
        await updateDoc(itemRef, { isHighlight: !item.isHighlight });
    };

    return (
        <>
            <h2>Upload New Technik Gallery Image</h2>
            <div className="admin-gallery-uploader">

                <section className="preview-section">
                    <h3>Select Grid Position</h3>
                    <div className="grid-preview">
                        {ALL_POSITIONS.map((pos) => {
                            const existing = galleryItems.find((item) => item.position === pos);
                            const isSelected = selectedPosition === pos;

                            const handleClick = (existing: GalleryItem) => {
                                setSelectedPosition(existing.position);
                                setTitle(existing.title);
                                setDescription(existing.description);
                                setColumnSpan(existing.span);
                                setPreviewImage(existing.imageUrl);
                                setUploadFile(null); // reset input
                                setEditingItem(existing);
                            };
                            return (
                                <div
                                    key={pos}
                                    className={`grid-cell ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                        if (existing) {
                                            handleClick(existing);
                                        } else {
                                            // Empty space clicked → exit edit mode and prep form
                                            resetForm(); // clears everything
                                            setSelectedPosition(pos); // prep for new upload
                                        }
                                    }}
                                    style={{
                                        gridColumn: `span ${
                                            isSelected ? columnSpan : existing?.span || 1
                                        }`
                                    }}
                                >
                                    {existing ? (
                                        <>
                                            <img src={isSelected ? previewImage : existing.imageUrl} alt={existing.title} />

                                            <button
                                                className={`highlight-button ${existing.isHighlight ? "active" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevents triggering cell click
                                                    toggleHighlight(existing);
                                                }}
                                            >
                                                ★
                                            </button>
                                        </>
                                    ) : isSelected && previewImage ? (
                                            <img src={previewImage} alt="Preview" />
                                        ) : (
                                                <span>{pos}</span>
                                            )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="form-section">
                    <div className="sticky">
                        <h3>Image Details</h3>
                        {selectedPosition && (
                            <div className={`form-mode-banner ${editingItem ? "editing" : "uploading"}`}>
                                {editingItem ? (
                                    <>✏️ Editing image: <strong>{editingItem.title || editingItem.position}</strong></>
                                ) : (
                                        <>📤 Uploading new image at: <strong>{selectedPosition}</strong></>
                                    )}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <input
                                disabled={loading}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setUploadFile(file);
                                        const reader = new FileReader();
                                        reader.onload = () => setPreviewImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <input
                                disabled={loading}
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <input
                                disabled={loading}
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <select disabled={loading} value={columnSpan} onChange={(e) => setColumnSpan(Number(e.target.value))}>
                                <option value={1}>Span 1</option>
                                <option value={2}>Span 2</option>
                                <option value={3}>Span 3</option>
                            </select>

                            <button type="submit" disabled={loading}>
                                {editingItem ? (loading ? "Updating..." : "Update") : (loading ? "Uploading..." : "Upload")}
                            </button>
                            {editingItem && (
                                <button
                                    disabled={loading}
                                    type="button"
                                    className="delete-button"
                                    onClick={async () => {
                                        const confirmDelete = window.confirm("Are you sure you want to delete this image?");
                                        if (!confirmDelete) return;

                                        setLoading(true);
                                        // Delete from storage
                                        const imageRef = ref(storage, editingItem.imageUrl);
                                        try {
                                            await deleteObject(imageRef);
                                        } catch (err) {
                                            console.warn("Storage file not found or already deleted");
                                        }

                                        // Delete from Firestore
                                        await deleteDoc(doc(db, "gallery-technik", editingItem.id));

                                        alert("Image deleted.");
                                        resetForm();
                                        setLoading(false);
                                    }}
                                >
                                    {loading ? "Deleting..." : "Delete Image"}
                                </button>
                            )}
                        </form>
                    </div>
                </section>
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner" />
                        <p>Loading...</p>
                    </div>
                )}
            </div>
        </>
    );
}
