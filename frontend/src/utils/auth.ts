import axios from "axios";

export default async function auth() {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }
  const { data } = await axios.get("http://localhost:3000" + "/user", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
