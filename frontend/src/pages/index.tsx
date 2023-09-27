import { useEffect, useState } from "react";
import auth from "../utils/auth";

export default function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    auth()
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setData(data);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    console.log(error);
    throw <h1>{error}</h1>;
  }

  if (data) {
    return <h1>wsp {data.firstName}</h1>;
  }
}
