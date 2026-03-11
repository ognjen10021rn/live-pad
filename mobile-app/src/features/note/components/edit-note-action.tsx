import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { CreatePollRequest, Poll } from "../types";
import { useState } from "react";
import CreatePollModal from "./create-poll-modal";

type EditActionProps = {
  type: string;
  icon: string;
  name: string;
  content?: string;
  noteId?: number;
  userId?: number;
  onPollCreate?: (
    poll: Omit<CreatePollRequest, "id" | "createdAt" | "totalVotes">
  ) => void;
};

export default function EditNoteAction({
  type,
  icon,
  name,
  content,
  noteId,
  userId,
  onPollCreate,
}: EditActionProps) {
  const [showPollModal, setShowPollModal] = useState(false);

  const doAction = async (type: string) => {
    switch (type) {
      case "copy":
        if (content) {
          Clipboard.setStringAsync(content);
        }
        break;
      case "poll":
        setShowPollModal(true);
        break;
      case "event":
        break;
    }
  };
  const handlePollCreate = (
    poll: Omit<CreatePollRequest, "id" | "createdAt" | "totalVotes">
  ) => {
    if (onPollCreate) {
      onPollCreate(poll);
    }
  };

  return (
    <>
      <Pressable
        onPress={() => doAction(type)}
        style={({ pressed }) => [
          styles.pillContainer,
          pressed && styles.pillContainerPressed,
        ]}
      >
        {({ pressed }) => (
          <FontAwesome5
            name={icon}
            size={20}
            color={pressed ? "#6e6e6e" : "#fff"}
          />
        )}
      </Pressable>

      {type === "poll" && noteId !== undefined && userId !== undefined && (
        <CreatePollModal
          visible={showPollModal}
          onClose={() => setShowPollModal(false)}
          onCreatePoll={handlePollCreate}
          noteId={noteId}
          userId={userId}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    backgroundColor: "#3d3d3d",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    width: 80,
    borderRadius: 15,
    borderColor: "#6e6e6e",
    borderStyle: "solid",
    borderWidth: 0.5,
  },
  pillContainerPressed: {
    backgroundColor: "#2d2d2d",
  },
  iconColor: {
    color: "#fff",
  },
  iconColorPressed: {
    color: "#6e6e6e",
  },
});
