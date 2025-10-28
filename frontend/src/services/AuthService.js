import axios from "axios";

// tested
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      const err = new Error(data.message);
      err.status = status;
      err.code = data.message;
      throw err;
    } else {
      const err = new Error("Network error");
      err.status = 0;
      err.code = "NETWORK_ERROR";
      throw err;
    }
  }
};

// tested
export const signupUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Missing email and / or password!");
  }

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
      {
        email,
        password,
      },
      { withCredentials: true }
    );

    if (res.status !== 200) {
      console.log(
        "Unexpected status returned: " + res.status + ": " + res.statusText
      );
    }
    return res.data;
  } catch (error) {
    console.log("Error logging in: " + error);
    throw new Error("Error logging in!");
  }
};

// tested
export const logoutUser = async () => {
  console.log("logging out...");
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/auth/logout`,
    { withCredentials: true }
  );
  return response.status;
};
