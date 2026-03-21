import { isAdminFromToken, useParseJwt } from "@/hooks/useParseJWT";
import { API_URL } from "@/paths";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const handleDeepLink = async (url: string) => {
  console.log("Handling deep link:", url);

  // Handle both exp:// and myapp:// schemes
  if (url.includes("/login") || url.includes("login?token=")) {
    const tokenMatch = url.match(/token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    console.log("Extracted token:", token);

    if (token) {
      let user = useParseJwt(token);

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          username: user.username,
          userId: user.id,
        })
      );
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdminFromToken(token)));
      router.replace("/homepage/homepage");
    } else {
      console.log("No token found in URL");
    }
  }
};

export const loginUser = async (text: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/user/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernameOrEmail: text,
        password: password,
      }),
    });
    if (!response.ok) {
      throw new Error("Login failed");
    }

    const tkn = await response.json();

    //set token as token
    await AsyncStorage.setItem("token", tkn.token);

    // parse token and get user
    let user = useParseJwt(tkn.token);

    await AsyncStorage.setItem(
      "user",
      JSON.stringify({
        username: user.username,
        userId: user.id,
      })
    );
    await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdminFromToken(tkn.token)));
    router.replace("/homepage/homepage");
  } catch (error) {
    console.log(error, "Login screen");
  }
};
