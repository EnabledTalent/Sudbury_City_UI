import BASE_URL from "../config/api";


export const registerUser = async (payload) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Registration failed");
  return res.json();
};



export const loginUser = async (username, password) => {
  const response = await fetch(
    `${BASE_URL}/signin?username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`,
    {
      method: "POST",
      headers: {
        accept: "*/*",
      },
    }
  );

  // ⛔ must be 200
  if (!response.ok) {
    throw new Error("Login failed");
  }

  // ✅ READ RAW TOKEN STRING
  const token = await response.text();

  if (!token) {
    throw new Error("Token missing");
  }

  // ✅ STORE TOKEN
  localStorage.setItem("token", token);

  // ✅ DECODE ROLE FROM JWT PAYLOAD
  const payload = JSON.parse(atob(token.split(".")[1]));
  localStorage.setItem("role", payload.role);

  return payload; // contains role, sub, exp, etc.
};
