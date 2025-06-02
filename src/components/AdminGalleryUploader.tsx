import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
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
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "gallery"), (snapshot) => {
            const items: GalleryItem[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as GalleryItem));

            // Sort by position for consistent layout
            const POSITION_ORDER = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "cA", "cB", "cC"];
            const sorted = POSITION_ORDER
            .map((pos) => items.find((item) => item.position === pos as unknown as number))
            .filter(Boolean) as GalleryItem[];

            setGalleryItems(sorted);
        });

        return () => unsubscribe(); // Clean up on unmount
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !selectedPosition) {
            alert('You need to select a file and a position!');
            return;
        }

        const storageRef = ref(storage, `gallery/${uploadFile.name}`);
        await uploadBytes(storageRef, uploadFile);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, "gallery"), {
            title,
            description,
            span: columnSpan,
            imageUrl,
            position: selectedPosition,
        });

        alert("Image uploaded!");

        // Reset form
        setTitle("");
        setDescription("");
        setColumnSpan(1);
        setUploadFile(null);
        setPreviewImage("");
        setSelectedPosition(null);
    };

    return (
        <>
            <h2>Upload New Gallery Image</h2>
            <div className="admin-gallery-uploader">

                <section className="preview-section">
                    <h3>Select Grid Position</h3>
                    <div className="grid-preview">
                        {ALL_POSITIONS.map((pos) => {
                            const existing = galleryItems.find((item) => item.position === pos as unknown as number);
                            const isSelected = selectedPosition === pos;

                            const handleClick = async () => {
                                if (existing) {
                                    const confirmDelete = window.confirm(
                                        `Position "${pos}" is already occupied. Do you want to replace this image?`
                                    );

                                    if (!confirmDelete) return;

                                    // Delete from storage
                                    const imageRef = ref(storage, existing.imageUrl);
                                    try {
                                        await deleteObject(imageRef);
                                    } catch (err) {
                                        console.warn("Storage file not found or already deleted");
                                    }

                                    // Delete from Firestore
                                    await deleteDoc(doc(db, "gallery", existing.id));

                                    // Remove from local state
                                    setGalleryItems((prev) => prev.filter((item) => item.id !== existing.id));
                                }

                                // Select the position for new upload
                                setSelectedPosition(pos);
                            };

                            return (
                                <div
                                    key={pos}
                                    className={`grid-cell ${isSelected ? "selected" : ""}`}
                                    onClick={handleClick}
                                    style={{
                                        gridColumn: `span ${existing?.span || (isSelected ? columnSpan : 1)}`,
                                    }}
                                >
                                    {existing ? (
                                        <img src={existing.imageUrl} alt={existing.title} />
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
                        <form onSubmit={handleUpload}>
                            <input
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
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <select value={columnSpan} onChange={(e) => setColumnSpan(Number(e.target.value))}>
                                <option value={1}>Span 1</option>
                                <option value={2}>Span 2</option>
                                <option value={3}>Span 3</option>
                            </select>

                            <button type="submit">Upload</button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
