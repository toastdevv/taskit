import { useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Page() {
  const emailRef: React.RefObject<HTMLInputElement> = useRef(null);
  const passwordRef: React.RefObject<HTMLInputElement> = useRef(null);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    if (email && password) {
      const { data } = await axios.post(
        "http://localhost:3000" + "/signup",
        {
          email,
          password,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!data.error) {
        localStorage.setItem("token", data.token);
        navigate("/");
      }
    }
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <h1 className="text-4xl font-semibold p-4">Create a new account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="mt-3 text-lg" htmlFor="email">
          Email
        </label>
        <input
          className="p-1 border-2 rounded-md border-black"
          ref={emailRef}
          placeholder="Enter your email"
          type="email"
          name="email"
        />
        <label className="mt-3 text-lg" htmlFor="password">
          Password
        </label>
        <input
          className="p-1 border-2 rounded-md border-black"
          ref={passwordRef}
          placeholder="Enter your password"
          type="password"
          name="password"
        />
        <button
          type="submit"
          className="mt-4 mb-2 border-2 underline hover:no-underline text-lg"
        >
          Sign Up
        </button>
        <div className="w-full text-center">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="underline hover:no-underline">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
