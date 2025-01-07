import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonToast,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonItem,
  IonInputPasswordToggle,
} from "@ionic/react";
import { Mail as MailIcon, Lock as LockIcon } from "iconoir-react";

import { Link, useHistory } from "react-router-dom";
import "./styles/Login.css";
import { useState } from "react";
import { useAuth } from "../services/auth/authContext";
import {
  posthogCaptureEvent,
  posthogIdentify,
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const history = useHistory();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await posthogCaptureEvent("user.login.attempt", { email });
      await login(email, password);
      await posthogCaptureEvent("user.login.success", { email });
      await await posthogIdentify(email);
      history.push("/home");
    } catch (error) {
      await posthogCaptureEvent("user.login.error", {
        error:
          error instanceof Error ? error.message : "Malformed error object!",
      });
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (event: CustomEvent) => {
    const newValue = event.detail.value ?? "";
    if (newValue !== password) {
      setPassword(newValue);
    }
  };

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  return (
    <IonPage className="auth-page">
      <div className="auth-background" />
      <IonContent fullscreen>
        <div className="auth-container">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Continue your journey with us</p>

          <div className="auth-form">
            <IonItem lines="none">
              <MailIcon className="input-icon" />
              <IonInput
                type="email"
                placeholder="Email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                className="auth-input"
              />
            </IonItem>
            <IonItem lines="none">
              <LockIcon className="input-icon" />
              <IonInput
                type="password"
                placeholder="Password"
                value={password}
                onIonInput={handlePasswordChange}
                className="auth-input"
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleLogin}
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </IonButton>

            <p className="auth-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </IonContent>
      <IonToast
        isOpen={!!error}
        message={error || ""}
        duration={3000}
        position="top"
        color="danger"
        onDidDismiss={() => setError(null)}
      />
    </IonPage>
  );
};

export default Login;
