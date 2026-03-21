import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    AdminUser,
    adminDeleteNote,
    deleteUser,
    fetchAllNotes,
    fetchAllUsers,
} from "@/src/features/admin/api";
import { NoteModel } from "@/src/features/note/types";
import CreateUserModal from "@/src/features/admin/components/create-user-modal";

export default function AdminDashboard() {
    const navigation = useNavigation();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [notes, setNotes] = useState<NoteModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateUser, setShowCreateUser] = useState(false);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, notesData] = await Promise.all([
                fetchAllUsers(),
                fetchAllNotes(),
            ]);
            setUsers(usersData);
            setNotes(
                (notesData as NoteModel[]).filter((n) => !n.isDeleted)
            );
        } catch (e) {
            console.error("Dashboard load error:", e);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
    }, []);

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (e) {
            console.error("Delete user error:", e);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            await adminDeleteNote(noteId);
            setNotes((prev) => prev.filter((n) => n.noteId !== noteId));
        } catch (e) {
            console.error("Delete note error:", e);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator color="#FFA500" size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFA500"
                    />
                }
            >
                {/* ── Users ─────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Users</Text>
                    <Pressable
                        style={styles.addBtn}
                        onPress={() => setShowCreateUser(true)}
                    >
                        <Text style={styles.addBtnText}>+ Create user</Text>
                    </Pressable>
                </View>

                {users.map((user) => (
                    <View key={user.id} style={styles.userRow}>
                        <View style={styles.rowLeft}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user.username.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.rowLabel}>{user.username}</Text>
                        </View>
                        <Pressable
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteUser(user.id)}
                        >
                            <MaterialIcons name="delete" size={18} color="#fff" />
                        </Pressable>
                    </View>
                ))}

                {users.length === 0 && (
                    <Text style={styles.emptyText}>No users found</Text>
                )}

                <View style={styles.divider} />

                {/* ── Notes ─────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                </View>

                <View style={styles.notesGrid}>
                    {notes.map((note) => (
                        <View key={note.noteId} style={styles.noteCard}>
                            <Pressable
                                style={styles.noteCardInner}
                                onPress={() =>
                                    router.push({
                                        pathname: "/admin/manage-note",
                                        params: {
                                            noteId: note.noteId,
                                            noteTitle: note.title ?? "Untitled",
                                        },
                                    })
                                }
                            >
                                <Text style={styles.noteTitle} numberOfLines={2}>
                                    {note.title ?? "Untitled"}
                                </Text>
                                {note.content ? (
                                    <Text style={styles.noteContent} numberOfLines={3}>
                                        {note.content}
                                    </Text>
                                ) : null}
                                <Text style={styles.noteDate}>
                                    {note.updatedAt
                                        ? new Date(note.updatedAt).toLocaleDateString()
                                        : ""}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={styles.noteDeleteBtn}
                                onPress={() => handleDeleteNote(note.noteId)}
                            >
                                <MaterialIcons name="delete" size={16} color="#ff4444" />
                            </Pressable>
                        </View>
                    ))}
                </View>

                {notes.length === 0 && (
                    <Text style={styles.emptyText}>No notes found</Text>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <CreateUserModal
                isShown={showCreateUser}
                onClose={() => {
                    setShowCreateUser(false);
                    loadData();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#151718",
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#101010",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
    },
    scroll: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        marginTop: 4,
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },
    addBtn: {
        borderWidth: 1,
        borderColor: "#555",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    addBtnText: {
        color: "#ddd",
        fontSize: 13,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1f1f1f",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 8,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#444",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    rowLabel: {
        color: "#fff",
        fontSize: 15,
    },
    deleteBtn: {
        backgroundColor: "#c0392b",
        borderRadius: 8,
        padding: 8,
    },
    divider: {
        height: 1,
        backgroundColor: "#2a2a2a",
        marginVertical: 20,
    },
    notesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    noteCard: {
        backgroundColor: "#333",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#444",
        width: "47%",
        minHeight: 110,
        overflow: "hidden",
    },
    noteCardInner: {
        padding: 14,
        flex: 1,
    },
    noteTitle: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
        marginBottom: 6,
    },
    noteContent: {
        color: "#aaa",
        fontSize: 12,
        lineHeight: 16,
    },
    noteDate: {
        color: "#666",
        fontSize: 11,
        marginTop: 8,
    },
    noteDeleteBtn: {
        alignSelf: "flex-end",
        padding: 6,
        marginRight: 6,
        marginBottom: 6,
    },
    emptyText: {
        color: "#888",
        textAlign: "center",
        marginVertical: 20,
        fontSize: 14,
    },
});
