import { IonContent, IonPage, IonInput, IonButton } from "@ionic/react";
import { Link } from "react-router-dom";
import "./styles/Signup.css";
import { useState } from "react";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    // Handle signup logic here
  };

  return (
    <IonPage className="auth-page">
      <div className="auth-background" />
      <IonContent fullscreen>
        <div className="auth-container">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Start your journey with us</p>

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
              onClick={handleSignup}
              className="auth-button"
            >
              Sign up
            </IonButton>

            <p className="auth-redirect">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
