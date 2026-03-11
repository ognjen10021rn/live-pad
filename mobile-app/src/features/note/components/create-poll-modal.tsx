import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { CreatePollRequest, Poll, PollOption } from "../types";

interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePoll: (
    poll: Omit<CreatePollRequest, "id" | "createdAt" | "totalVotes">
  ) => void;
  noteId: number;
  userId: number;
}

export default function CreatePollModal({
  visible,
  onClose,
  onCreatePoll,
  noteId,
  userId,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [hasExpiration, setHasExpiration] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    // Validate
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      alert("Please add at least 2 options");
      return;
    }

    // Create poll options
    const pollOptions: PollOption[] = validOptions.map((text, index) => ({
      id: index,
      text: text.trim(),
      votes: 0,
      votedBy: [],
    }));

    // Create poll object
    const newPoll: Omit<CreatePollRequest, "id" | "createdAt" | "totalVotes"> =
      {
        noteId,
        question: question.trim(),
        options: pollOptions.map((option) => option.text),
        createdBy: userId,
        allowMultipleVotes,
        expiresAt: hasExpiration
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      };

    onCreatePoll(newPoll);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultipleVotes(false);
    setHasExpiration(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Poll</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <FontAwesome5 name='times' size={24} color='#fff' />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.label}>Question</Text>
              <TextInput
                style={styles.input}
                placeholder="What's your question?"
                placeholderTextColor='#999'
                value={question}
                onChangeText={setQuestion}
                maxLength={200}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Options</Text>
              {options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <TextInput
                    style={[styles.input, styles.optionInput]}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor='#999'
                    value={option}
                    onChangeText={(text) => updateOption(index, text)}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <Pressable
                      onPress={() => removeOption(index)}
                      style={styles.removeButton}
                    >
                      <FontAwesome5 name='trash' size={16} color='#ff4444' />
                    </Pressable>
                  )}
                </View>
              ))}
              {options.length < 10 && (
                <Pressable onPress={addOption} style={styles.addButton}>
                  <FontAwesome5 name='plus' size={16} color='#4a90e2' />
                  <Text style={styles.addButtonText}>Add Option</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Allow multiple votes</Text>
                <Switch
                  value={allowMultipleVotes}
                  onValueChange={setAllowMultipleVotes}
                  trackColor={{ false: "#767577", true: "#4a90e2" }}
                  thumbColor='#fff'
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Set expiration (7 days)</Text>
                <Switch
                  value={hasExpiration}
                  onValueChange={setHasExpiration}
                  trackColor={{ false: "#767577", true: "#4a90e2" }}
                  thumbColor='#fff'
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={handleClose}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              style={[styles.button, styles.createButton]}
            >
              <Text style={styles.createButtonText}>Create Poll</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#4a90e2",
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: "#4a90e2",
    marginLeft: 8,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchLabel: {
    color: "#fff",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#2a2a2a",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#4a90e2",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
