import { useState } from "react";
import { db, storage } from "../lib/firebaseClient";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./JobsForm.scss";

const JobForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        requirements: [""],
        tasks: [""],
        offer: [""],
        image: null,
    });

    const handleArrayChange = (key, index, value) => {
        const updated = [...formData[key]];
        updated[index] = value;
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
        let imageUrl = "";
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

        await addDoc(collection(db, "jobs"), jobData);
        alert("Job posted successfully!");
        setFormData({
            name: "",
            description: "",
            requirements: [""],
            tasks: [""],
            offer: [""],
            image: null,
        });
    };

    return (
        <form className="job-form" onSubmit={handleSubmit}>
            <h2>Edit Job Position</h2>

            <label>
                Job Name:
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </label>

            <label>
                Small Description:
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </label>

            {["requirements", "tasks", "offer"].map((field) => (
                <div key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    {formData[field].map((item, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                            placeholder={`Enter ${field} ${idx + 1}`}
                            required
                        />
                    ))}
                    <button type="button" onClick={() => addArrayItem(field)}>+ Add {field}</button>
                </div>
            ))}

            <label>
                Job Image:
                <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            <button type="submit">Submit</button>
        </form>
    );
};

export default JobForm;
