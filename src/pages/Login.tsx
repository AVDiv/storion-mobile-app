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
      <div className="auth-background">
        <div className="auth-decoration"></div>
      </div>
      <IonContent fullscreen className="ion-padding auth-content">
        <div className="auth-container">
          <div className="auth-header">
            <div className="logo-container">
              <div className="app-logo">
                <div className="logo-icon">S</div>
              </div>
            </div>

            <h1>Welcome Back</h1>
            <p className="auth-subtitle">Continue your journey with us</p>
          </div>

          <div className="auth-form">
            <div className="form-header">Login to your account</div>

            <IonItem lines="none" className="auth-item">
              <MailIcon className="input-icon" />
              <IonInput
                type="email"
                placeholder="Email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                className="auth-input"
              />
            </IonItem>

            <IonItem lines="none" className="auth-item">
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

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <IonButton
              expand="block"
              onClick={handleLogin}
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-container">
                  <div className="button-spinner"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Login"
              )}
            </IonButton>

            <div className="divider">
              <span>OR</span>
            </div>

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
