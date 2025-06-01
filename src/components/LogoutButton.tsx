import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";

export default function LogoutButton() {
  return (
    <button className="logout-btn" onClick={() => signOut(auth)}>
      Log Out
      <style>{`
        .logout-btn {
          background: #ef4444;
          border: none;
          color: white;
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;
        }
        .logout-btn:hover {
          background: #dc2626;
        }
        .logout-btn:active {
          background: #b91c1c;
        }
      `}</style>
    </button>
  );
}
