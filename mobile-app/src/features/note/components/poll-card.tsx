// components/PollCard.tsx

import React, { useState, useMemo, useEffect, useReducer } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Poll, PollOption } from "../types";

interface PollCardProps {
  poll: Poll;
  currentUserId: number;
  onVote: (pollId: number, optionId: number) => void;
}

export default function PollCard({
  poll,
  currentUserId,
  onVote,
}: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(
    new Set()
  );
  const [localPoll, setLocalPoll] = useState(poll);

  // Check if current user has already voted
  const userVotedOptions = useMemo(() => {
    const voted = new Set<number>();
    localPoll.options.forEach((option) => {
      if (option.votedBy.includes(currentUserId)) {
        voted.add(option.id);
      }
    });
    return voted;
  }, [localPoll.options, currentUserId]);

  const hasVoted = userVotedOptions.size > 0;

  const handleOptionPress = (optionId: number) => {
    console.log(optionId);
    if (hasVoted && !localPoll.allowMultipleVotes) {
      return; // Can't change vote if multiple votes not allowed
    }

    if (localPoll.allowMultipleVotes) {
      const newSelected = new Set(selectedOptions);
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId);
      } else {
        newSelected.add(optionId);
      }
      setSelectedOptions(newSelected);
    } else {
      setSelectedOptions(new Set([optionId]));
    }
  };

  const handleVote = () => {
    setLocalPoll((prev) => {
      const updatedOptions = prev.options.map((o) =>
        selectedOptions.has(o.id) ? { ...o, votes: o.votes + 1 } : o
      );

      return {
        ...prev,
        options: updatedOptions,
        totalVotes: prev.totalVotes + selectedOptions.size,
      };
    });

    selectedOptions.forEach((optionId) => {
      onVote(localPoll.id, optionId);
    });

    setSelectedOptions(new Set());
  };

  const calculatePercentage = (option: PollOption) => {
    if (localPoll.totalVotes === 0) return 0;
    console.log(localPoll.totalVotes, option.votes);
    return (option.votes / localPoll.totalVotes) * 100;
  };

  const isExpired = useMemo(() => {
    if (!localPoll.expiresAt) return false;
    return new Date(localPoll.expiresAt) < new Date();
  }, [localPoll.expiresAt]);

  const canVote = !hasVoted || poll.allowMultipleVotes;
  let showResults = hasVoted || isExpired;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name='poll' size={18} color='#4a90e2' />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.question}>{localPoll.question}</Text>
          <Text style={styles.votesCount}>
            {localPoll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
            {localPoll.allowMultipleVotes && " • Multiple choice"}
            {isExpired && " • Expired"}
          </Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {localPoll.options.map((option) => {
          const percentage = calculatePercentage(option);
          const isSelected = selectedOptions.has(option.id);
          const isVoted = userVotedOptions.has(option.id);

          return (
            <Pressable
              key={option.id}
              onPress={() => !isExpired && handleOptionPress(option.id)}
              disabled={
                isExpired || (!canVote && !localPoll.allowMultipleVotes)
              }
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isVoted && styles.optionVoted,
                isExpired && styles.optionDisabled,
              ]}
            >
              <View style={styles.optionContent}>
                {showResults && (
                  <View
                    style={[styles.progressBar, { width: `${percentage}%` }]}
                  />
                )}
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>{option.text}</Text>
                  {showResults && (
                    <Text style={styles.percentageText}>
                      {percentage.toFixed(0)}%
                    </Text>
                  )}
                </View>
                {!showResults && (isSelected || isVoted) && (
                  <FontAwesome5
                    name={
                      localPoll.allowMultipleVotes
                        ? isSelected
                          ? "check-square"
                          : "square"
                        : "dot-circle"
                    }
                    size={20}
                    color='#4a90e2'
                    style={styles.checkIcon}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {canVote && !isExpired && selectedOptions.size > 0 && (
        <Pressable onPress={() => handleVote()} style={styles.voteButton}>
          <Text style={styles.voteButtonText}>
            {hasVoted ? "Update Vote" : "Submit Vote"}
          </Text>
        </Pressable>
      )}

      {localPoll.expiresAt && !isExpired && (
        <Text style={styles.expirationText}>
          Expires {new Date(localPoll.expiresAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  votesCount: {
    fontSize: 13,
    color: "#999",
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#3a3a3a",
  },
  optionSelected: {
    borderColor: "#4a90e2",
  },
  optionVoted: {
    borderColor: "#4a90e2",
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    position: "relative",
    minHeight: 48,
    justifyContent: "center",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(74, 144, 226, 0.2)",
  },
  optionTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    zIndex: 1,
  },
  optionText: {
    fontSize: 15,
    color: "#fff",
    flex: 1,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a90e2",
    marginLeft: 8,
  },
  voteCount: {
    fontSize: 13,
    color: "#999",
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -6.5 }],
  },
  checkIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  voteButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  voteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  expirationText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
});
