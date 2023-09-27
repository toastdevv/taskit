import { useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Page() {
  const firstNameRef: React.RefObject<HTMLInputElement> = useRef(null);
  const lastNameRef: React.RefObject<HTMLInputElement> = useRef(null);
  const emailRef: React.RefObject<HTMLInputElement> = useRef(null);
  const passwordRef: React.RefObject<HTMLInputElement> = useRef(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const firstName = firstNameRef.current?.value;
    const lastName = lastNameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    if (email && password && firstName && lastName) {
      const { data } = await axios.post(
        "http://localhost:3000" + "/signup",
        {
          firstName,
          lastName,
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
        navigate("/~");
      }
    }
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <h1 className="text-4xl font-semibold p-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="email">First Name</label>
        <input ref={lastNameRef} placeholder="John" name="first-name" />
        <label htmlFor="email">Last Name</label>
        <input ref={firstNameRef} placeholder="Doe" name="last-name" />
        <label htmlFor="email">Email</label>
        <input ref={emailRef} placeholder="example@xyz.com" name="email" />
        <label htmlFor="password">Password</label>
        <input
          ref={passwordRef}
          placeholder="example@xyz.com"
          name="password"
        />
        <button type="submit" className="underline hover:no-underline">
          Login
        </button>
      </form>
    </div>
  );
}
