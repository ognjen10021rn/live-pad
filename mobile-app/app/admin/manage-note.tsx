import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
    fetchUsersInNote,
    removeUsersFromNote,
    addUsersToNote,
    getPollsByNoteId,
    deletePoll,
    createPoll,
} from "@/src/features/note/api/intex";
import { Poll } from "@/src/features/note/types";
import { UserModelDto } from "@/src/features/types/user-model";
import AddRemoveUsersFromNote from "@/src/features/note/components/add-remove-users-from-note";
import CreatePollModal from "@/src/features/note/components/create-poll-modal";

export default function AdminManageNote() {
    const { noteId, noteTitle } = useLocalSearchParams<{
        noteId: string;
        noteTitle: string;
    }>();
    const navigation = useNavigation();
    const [userId, setUserId] = useState(0);
    const [users, setUsers] = useState<UserModelDto[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showCreatePoll, setShowCreatePoll] = useState(false);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const stored = await AsyncStorage.getItem("user");
            let uId = 0;
            if (stored) {
                uId = JSON.parse(stored).userId;
                setUserId(uId);
            }
            const id = Number(noteId);
            const [usersData, pollsData] = await Promise.all([
                fetchUsersInNote(id, uId),
                getPollsByNoteId(id),
            ]);
            setUsers(usersData);
            setPolls(pollsData);
        } catch (e) {
            console.error("Manage note load error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (targetUserId: number) => {
        try {
            await removeUsersFromNote(Number(noteId), userId, [targetUserId]);
            setUsers((prev) => prev.filter((u) => u.userId !== targetUserId));
        } catch (e) {
            console.error("Remove user error:", e);
        }
    };

    const handleDeletePoll = async (pollId: number) => {
        try {
            await deletePoll(pollId, userId);
            setPolls((prev) => prev.filter((p) => p.id !== pollId));
        } catch (e) {
            console.error("Delete poll error:", e);
        }
    };

    const handleCreatePoll = async (pollData: any) => {
        try {
            await createPoll(pollData);
            const updated = await getPollsByNoteId(Number(noteId));
            setPolls(updated);
            setShowCreatePoll(false);
        } catch (e) {
            console.error("Create poll error:", e);
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
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Manage Note
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {noteTitle ? (
                <Text style={styles.noteSubtitle} numberOfLines={1}>
                    {noteTitle}
                </Text>
            ) : null}

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Users ─────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Users</Text>
                    <Pressable
                        style={styles.addBtn}
                        onPress={() => setShowAddUser(true)}
                    >
                        <Text style={styles.addBtnText}>+ Add user</Text>
                    </Pressable>
                </View>

                {users.map((user) => (
                    <View key={user.userId} style={styles.row}>
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
                            onPress={() => handleRemoveUser(user.userId)}
                        >
                            <MaterialIcons name="delete" size={18} color="#fff" />
                        </Pressable>
                    </View>
                ))}

                {users.length === 0 && (
                    <Text style={styles.emptyText}>No users in this note</Text>
                )}

                <View style={styles.divider} />

                {/* ── Polls ─────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Polls</Text>
                    <Pressable
                        style={styles.addBtn}
                        onPress={() => setShowCreatePoll(true)}
                    >
                        <Text style={styles.addBtnText}>+ Create Poll</Text>
                    </Pressable>
                </View>

                {polls.map((poll) => (
                    <View key={poll.id} style={styles.row}>
                        <View style={styles.rowLeft}>
                            <MaterialCommunityIcons name="poll" size={26} color="#aaa" />
                            <Text style={styles.rowLabel} numberOfLines={1}>
                                {poll.question}
                            </Text>
                        </View>
                        <Pressable
                            style={styles.deleteBtn}
                            onPress={() => handleDeletePoll(poll.id)}
                        >
                            <MaterialIcons name="delete" size={18} color="#fff" />
                        </Pressable>
                    </View>
                ))}

                {polls.length === 0 && (
                    <Text style={styles.emptyText}>No polls in this note</Text>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={() => router.back()}>
                    <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
            </View>

            {/* Add/Remove Users modal */}
            <AddRemoveUsersFromNote
                isShown={showAddUser}
                noteId={Number(noteId)}
                userId={userId}
                onClose={() => {
                    setShowAddUser(false);
                    loadData();
                }}
            />

            {/* Create Poll modal */}
            <CreatePollModal
                visible={showCreatePoll}
                noteId={Number(noteId)}
                userId={userId}
                onClose={() => setShowCreatePoll(false)}
                onCreatePoll={handleCreatePoll}
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
        paddingBottom: 16,
        backgroundColor: "#1e1e1e",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
    },
    noteSubtitle: {
        color: "#aaa",
        fontSize: 13,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: "#1e1e1e",
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a2a",
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
    row: {
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
        flex: 1,
        marginRight: 8,
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
        flex: 1,
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
    emptyText: {
        color: "#888",
        textAlign: "center",
        marginVertical: 16,
        fontSize: 14,
    },
    bottomBar: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingBottom: 34,
        backgroundColor: "#1e1e1e",
        borderTopWidth: 1,
        borderTopColor: "#2a2a2a",
    },
    saveBtn: {
        flex: 1,
        backgroundColor: "#FFA500",
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: "center",
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#2b2b2b",
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: "center",
    },
    cancelBtnText: {
        color: "#aaa",
        fontWeight: "600",
        fontSize: 15,
    },
});
