import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { createUser } from "@/src/features/admin/api";

interface Props {
    isShown: boolean;
    onClose: () => void;
}

export default function CreateUserModal({ isShown, onClose }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("ROLE_USER");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const translateY = useRef(new Animated.Value(600)).current;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isShown ? 0 : 600,
            duration: isShown ? 300 : 200,
            useNativeDriver: true,
        }).start();
    }, [isShown]);

    const handleSave = async () => {
        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await createUser(email.trim(), password, role.trim() || "ROLE_USER");
            setEmail("");
            setPassword("");
            setRole("ROLE_USER");
            onClose();
        } catch {
            setError("Failed to create user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEmail("");
        setPassword("");
        setRole("ROLE_USER");
        setError("");
        onClose();
    };

    return (
        <Modal
            transparent
            visible={isShown}
            animationType="none"
            onRequestClose={handleCancel}
        >
            <TouchableWithoutFeedback onPress={handleCancel}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
                pointerEvents="box-none"
            >
                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY }] }]}
                >
                    <View style={styles.sheetHeader}>
                        <Text style={styles.title}>Create User</Text>
                        <Pressable onPress={handleCancel} hitSlop={10}>
                            <Text style={styles.closeBtn}>✕</Text>
                        </Pressable>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Role (e.g. ROLE_USER)"
                        placeholderTextColor="#888"
                        value={role}
                        onChangeText={setRole}
                        autoCapitalize="characters"
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttons}>
                        <Pressable
                            style={styles.saveBtn}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.saveBtnText}>
                                {loading ? "Saving…" : "Save"}
                            </Text>
                        </Pressable>
                        <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    keyboardView: {
        flex: 1,
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#1f1f1f",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    closeBtn: {
        color: "#aaa",
        fontSize: 18,
        fontWeight: "400",
    },
    input: {
        backgroundColor: "#2b2b2b",
        borderRadius: 10,
        color: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 15,
    },
    errorText: {
        color: "#ff4444",
        fontSize: 13,
        marginBottom: 10,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
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
