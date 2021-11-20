import "./style.css";
import { useState } from "react";

const Register = ({ onRegister, onBack }) => {
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [name, setName] = useState(undefined);
  const [username, setUsername] = useState(undefined);
  const [password2, setPassword2] = useState(undefined);

  const updateEmail = () => {
    setEmail(document.getElementById("emailID").value);
  };

  const updatePassword = () => {
    setPassword(document.getElementById("passwordID").value);
  };

  const updatePassword2 = () => {
    setPassword2(document.getElementById("password2ID").value);
  };

  const updateName = () => {
    setName(document.getElementById("nameID").value);
  };

  const updateUsername = () => {
    setUsername(document.getElementById("usernameID").value);
  };

  return (
    <div className="register">
      <span className="heading">
        Team Workouts
        <br />
      </span>
      <span className="label">username</span>
      <input
        id="usernameID"
        type="text"
        className="input"
        onChange={updateUsername}
      />
      <span className="label">name</span>
      <input id="nameID" type="text" className="input" onChange={updateName} />
      <span className="label">email</span>
      <input
        id="emailID"
        type="text"
        className="input"
        onChange={updateEmail}
      />
      <span className="label">password</span>
      <input
        id="passwordID"
        type="text"
        className="input"
        onChange={updatePassword}
      />
      <span className="label">confirm password</span>
      <input
        id="password2ID"
        type="text"
        className="input"
        onChange={updatePassword2}
      />
      <button
        data-testid={"registerButton"}
        className="button"
        onClick={() => onRegister()}
      >
        Register
      </button>
      <button
        data-testid={"backButton"}
        className="button"
        onClick={() => onBack()}
      >
        Back
      </button>
    </div>
  );
};

export default Register;
