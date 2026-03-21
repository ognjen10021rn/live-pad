import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/paths";

const getToken = async () => AsyncStorage.getItem("token");

export interface AdminUser {
    id: number;
    username: string;
    email: string;
}

export const fetchAllUsers = async (): Promise<AdminUser[]> => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/v1/user/admin/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
};

export const createUser = async (
    email: string,
    password: string,
    role: string
) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/v1/user/admin/create`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
};

export const deleteUser = async (userId: number) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/v1/user/admin/delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete user");
};

export const fetchAllNotes = async () => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/v1/note/admin/getAllNotes`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
};

export const adminDeleteNote = async (noteId: number) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/v1/note/admin/delete/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete note");
};
