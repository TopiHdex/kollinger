import { useState, useEffect } from "react";
import { db, storage } from "../lib/firebaseClient";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "./JobsForm.scss";

const JobManager = () => {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        requirements: [""],
        tasks: [""],
        offer: [""],
        image: null,
        imageUrl: "",
    });

    useEffect(() => {
        const fetchJobs = async () => {
            const snapshot = await getDocs(collection(db, "jobs"));
            const jobList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setJobs(jobList);
        };
        fetchJobs();
    }, []);

    const handleSelectJob = (job) => {
        setSelectedJobId(job.id);
        setFormData({
            name: job.name || "",
            description: job.description || "",
            requirements: job.requirements || [""],
            tasks: job.tasks || [""],
            offer: job.offer || [""],
            image: null,
            imageUrl: job.imageUrl || "",
        });
    };

    const handleArrayChange = (key, index, value) => {
        const updated = [...formData[key]];
        updated[index] = value;
        setFormData({ ...formData, [key]: updated });
    };

    const removeArrayItem = (key, index) => {
        const confirmed = confirm("Are you sure you want to delete this item?");
        if (!confirmed) return;

        const updated = [...formData[key]];
        updated.splice(index, 1);

        // Ensure at least one input remains
        if (updated.length === 0) updated.push("");

        setFormData({ ...formData, [key]: updated });
    };

    const addArrayItem = (key) => {
        setFormData({ ...formData, [key]: [...formData[key], ""] });
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = formData.imageUrl;

            if (formData.image) {
                const imageRef = ref(storage, `jobs/${formData.image.name}`);
                await uploadBytes(imageRef, formData.image);
                imageUrl = await getDownloadURL(imageRef);
            }

            const jobData = {
                name: formData.name,
                description: formData.description,
                requirements: formData.requirements,
                tasks: formData.tasks,
                offer: formData.offer,
                imageUrl,
            };

            if (selectedJobId) {
                await updateDoc(doc(db, "jobs", selectedJobId), jobData);
                alert("Job updated successfully!");
            } else {
                await addDoc(collection(db, "jobs"), jobData);
                alert("Job created successfully!");
            }

            const snapshot = await getDocs(collection(db, "jobs"));
            const jobList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setJobs(jobList);
            setSelectedJobId(null);
            setFormData({
                name: "",
                description: "",
                requirements: [""],
                tasks: [""],
                offer: [""],
                image: null,
                imageUrl: "",
            });
        } catch (error) {
            console.error("Submission error:", error);
            alert("Error saving the job. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async () => {
        if (!selectedJobId) return;
        const confirmed = confirm("Are you sure you want to delete this job?");
        if (!confirmed) return;

        setLoading(true);
        try {
            const jobToDelete = jobs.find(job => job.id === selectedJobId);

            // Delete image from storage if available
            if (jobToDelete.imageUrl) {
                try {
                    const path = new URL(jobToDelete.imageUrl).pathname;
                    const filename = decodeURIComponent(path.split("/").pop());
                    const imgRef = ref(storage, `jobs/${filename}`);
                    await deleteObject(imgRef);
                } catch (e) {
                    console.warn("Image deletion failed (may not exist):", e);
                }
            }

            // Delete job document
            await deleteDoc(doc(db, "jobs", selectedJobId));

            // Refresh job list
            const snapshot = await getDocs(collection(db, "jobs"));
            const jobList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setJobs(jobList);

            // Clear form
            setSelectedJobId(null);
            setFormData({
                name: "",
                description: "",
                requirements: [""],
                tasks: [""],
                offer: [""],
                image: null,
                imageUrl: "",
            });

            alert("Job deleted successfully.");
        } catch (error) {
            console.error("Failed to delete job:", error);
            alert("Error deleting job.");
        } finally {
            setLoading(false);
        }
    };

    const publish = () => {
        const confirm = window.confirm("Are you sure you want to publish?");
        if (!confirm) return;

        fetch('https://api.vercel.com/v1/integrations/deploy/prj_Az0b0vAg5ub2On8prkJaOAIp9fOu/iqnfhwU8qP', { method: 'POST' })
    };

    return (
        <>
            <button onClick={publish} style={{ margin: '1rem auto', display: 'block' }}>Publish</button>
            <div className="job-manager">
                <aside className="job-list">
                    <h3>Job Positions</h3>
                    <ul>
                        {jobs.map((job) => (
                            <li
                                key={job.id}
                                className={selectedJobId === job.id ? "active" : ""}
                                onClick={() => handleSelectJob(job)}
                            >
                                {job.name}
                            </li>
                        ))}
                    </ul>
                </aside>

                <form className="job-form" onSubmit={handleSubmit}>
                    <h2>{selectedJobId ? "Edit Job" : "New Job"}</h2>

                    <label>
                        Job Name:
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            disabled={loading}
                        />
                    </label>

                    <label>
                        Small Description:
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            required
                            disabled={loading}
                        />
                    </label>

                    {["requirements", "tasks", "offer"].map((field) => (
                        <div key={field}>
                            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                            {formData[field].map((item, idx) => (
                                <div className="array-item" key={idx}>
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                                        placeholder={`Enter ${field} ${idx + 1}`}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => removeArrayItem(field, idx)}
                                        title="Remove item"
                                        disabled={loading}
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                            <button disabled={loading} type="button" onClick={() => addArrayItem(field)}>
                                + Add {field}
                            </button>
                        </div>
                    ))}

                    <label>
                        Job Image:
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>

                    <button type="submit">{selectedJobId ? "Update" : "Create"} Job</button>
                    {selectedJobId && (
                        <button
                            type="button"
                            onClick={handleDeleteJob}
                            className="delete-job-btn"
                            disabled={loading}
                        >
                            🗑 Delete Job
                        </button>
                    )}
                </form>
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner" />
                        <p>Loading...</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default JobManager;
