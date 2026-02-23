import { useEffect } from "react";

function Login() {
  useEffect(() => {
    fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "sayf",
        password: "eddine",
      }),
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));
  }, []); // runs once

  return <div>Login test</div>;
}

export default Login;
