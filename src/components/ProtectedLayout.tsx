import type { PropsWithChildren } from "react";
import { useAuth } from "../utils/useAuth";
import Login from "./Login";

export default function ProtectedLayout({ children }: PropsWithChildren) {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Login />;

    return <>{children}</>;
}
