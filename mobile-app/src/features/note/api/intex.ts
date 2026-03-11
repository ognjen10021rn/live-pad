import { API_URL } from "@/paths";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserModelDto } from "../../types/user-model";
import { CreatePollRequest, Poll } from "../types";

export class FetchUsersError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "FetchUsersError";
  }
}
export class UpdateUsersError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "UpdateUsersError";
  }
}
export class CreateNoteError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "CreateNoteError";
  }
}

/**
 *
 * @param noteId
 * @returns Get all users that are not in the note
 */
export async function fetchUsersNotInNote(
  noteId: number
): Promise<UserModelDto[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/user/getAllUsersThatAreNotInNoteId/${noteId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        "Error in fetching notes: " + errorText + " " + response.status
      );
    }
    const responseData = await response.json();
    return responseData as UserModelDto[];
  } catch (error) {
    if (error instanceof FetchUsersError) {
      throw error;
    }
    throw new FetchUsersError(
      error instanceof Error ? error.message : "An unknown error occured"
    );
  }
}

/**
 *
 * @param noteId
 * @param userId
 * @returns All users that are in the current note excluding the admin
 */
export async function fetchUsersInNote(
  noteId: number,
  userId: number
): Promise<UserModelDto[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/user/getAllUsersFromNoteUsingNoteId/${noteId}/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        "Error in fetching notes: " + errorText + " " + response.status
      );
    }
    const responseData = await response.json();
    return responseData as UserModelDto[];
  } catch (error) {
    if (error instanceof FetchUsersError) {
      throw error;
    }
    throw new FetchUsersError(
      error instanceof Error ? error.message : "An unknown error occured"
    );
  }
}

/**
 *
 * @param noteId
 * @param userId
 * @param userIds User ids to add to Note
 */
export async function addUsersToNote(
  noteId: number,
  userId: number,
  userIds: number[]
) {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/user/addUserToNote/${noteId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          userIds: userIds,
        }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        "Error in adding users to note: " + errorText + " " + response.status
      );
    }
  } catch (error) {
    if (error instanceof UpdateUsersError) {
      throw error;
    }
    throw new UpdateUsersError(
      error instanceof Error ? error.message : "An unknown error occured"
    );
  }
}

/**
 *
 * @param noteId
 * @param userId
 * @param userIds User ids to remove from Note
 */
export async function removeUsersFromNote(
  noteId: number,
  userId: number,
  userIds: number[]
) {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/user/removeUserFromNote/${noteId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          userIds: userIds,
        }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        "Error in removing users from note: " +
          errorText +
          " " +
          response.status
      );
    }
  } catch (error) {
    if (error instanceof UpdateUsersError) {
      throw error;
    }
    throw new UpdateUsersError(
      error instanceof Error ? error.message : "An unknown error occured"
    );
  }
}

export async function fetchUsersWithoutUserId(
  userId: number
): Promise<UserModelDto[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/user/getAllUsersWithoutId/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        "Error in fetching users without id: " +
          errorText +
          " " +
          response.status
      );
    }
    const responseData = await response.json();
    return responseData as UserModelDto[];
  } catch (error) {
    if (error instanceof FetchUsersError) {
      throw error;
    }
    throw new FetchUsersError(
      error instanceof Error ? error.message : "An unknown error occured"
    );
  }
}

/**
 * Creating a note
 * @param userId Owner Id
 * @param title Title of note
 * @param userIds Ids to add to note
 * @returns
 */
export async function createNote(
  userId: number,
  title: string,
  userIds: number[]
) {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/note/createNote/${userId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          userIds: userIds,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(
        "Error in fetching users without id: " +
          errorText +
          " " +
          response.status
      );
    }
  } catch (error) {
    if (error instanceof CreateNoteError) {
      throw error;
    }
    throw new CreateNoteError(
      error instanceof Error ? error.message : "An unknown error occured"
    );
  }
}

// Create a new poll
export async function createPoll(
  poll: Omit<CreatePollRequest, "id" | "createdAt" | "totalVotes">
): Promise<Poll> {
  console.log(poll);
  try {
    const response = await fetch(`${API_URL}/api/v1/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
      body: JSON.stringify(poll),
    });

    if (!response.ok) {
      throw new Error("Failed to create poll");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
}

export async function getPollsByNoteId(noteId: number): Promise<Poll[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/polls?noteId=${noteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch polls");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching polls:", error);
    throw error;
  }
}

export async function vote(
  pollId: number,
  optionId: number,
  userId: number
): Promise<Poll> {
  try {
    const response = await fetch(`${API_URL}/api/v1/polls/${pollId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        optionId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit vote");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
}

export async function deletePoll(
  pollId: number,
  userId: number
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/v1/polls/${pollId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete poll");
    }
  } catch (error) {
    console.error("Error deleting poll:", error);
    throw error;
  }
}

export async function updatePoll(
  pollId: number,
  updates: Partial<Poll>
): Promise<Poll> {
  try {
    const response = await fetch(`${API_URL}/api/v1/polls/${pollId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to update poll");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
}
