import { useState } from "react";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const registerUser = async () => {
    try {
      await API.post("/auth/register", form);

      alert("Registration Successful");
    } catch (error) {
      alert("Registration Failed");
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <input
        placeholder="Name"
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <br /><br />

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <br /><br />

      <button onClick={registerUser}>
        Register
      </button>
    </div>
  );
}

export default Register;