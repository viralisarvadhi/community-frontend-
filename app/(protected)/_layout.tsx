import { Redirect, Slot } from "expo-router";
import { useAppSelector } from "../../src/store/hooks";

export default function ProtectedLayout() {
    const token = useAppSelector((s) => s.auth.token);
    if (!token) return <Redirect href="/login" />;
    return <Slot />;
}
