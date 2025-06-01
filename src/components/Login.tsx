import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseClient";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="login-container">
            <h2>Admin Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="error">{error}</p>}

                <button type="submit">Login</button>
            </form>

            <style jsx>{`
            .login-container {
              max-width: 400px;
              margin: 5rem auto;
              padding: 2rem;
              background: #fafafa;
              border-radius: 8px;
              box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
            }
            form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            input {
              padding: 0.75rem;
              font-size: 1rem;
              border: 1px solid #ccc;
              border-radius: 6px;
            }
            button {
              padding: 0.75rem;
              background-color: #0070f3;
              color: white;
              font-weight: bold;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            }
            .error {
              color: red;
            }
            `}</style>
        </div>
    );
}
