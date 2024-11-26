import { IonContent, IonPage, IonInput, IonButton } from "@ionic/react";
import { Link } from "react-router-dom";
import "./styles/Login.css";
import { useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Handle login logic here
  };

  return (
    <IonPage className="auth-page">
      <div className="auth-background" />
      <IonContent fullscreen>
        <div className="auth-container">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Continue your journey with us</p>

          <div className="auth-form">
            <div className="input-group">
              <IonInput
                type="email"
                placeholder="Email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <IonInput
                type="password"
                placeholder="Password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                className="auth-input"
              />
            </div>

            <IonButton
              expand="block"
              onClick={handleLogin}
              className="auth-button"
            >
              Login
            </IonButton>

            <p className="auth-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
