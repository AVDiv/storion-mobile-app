import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonInputPasswordToggle,
  IonToast,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { Link, useHistory } from "react-router-dom";
import "./styles/Signup.css";
import { useState } from "react";
import {
  Lock as LockIcon,
  Mail as MailIcon,
  User as UserIcon,
} from "iconoir-react";
import { useAuth } from "../services/auth/authContext";
import {
  posthogCaptureEvent,
  posthogIdentify,
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";
import PasswordChecklist from "../components/PasswordChecklist";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastStatus, setToastStatus] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const { signup } = useAuth();
  const history = useHistory();

  const handleSignup = async () => {
    if (!isPasswordValid) return;
    setIsLoading(true);
    setToastMessage(null);
    setToastStatus(null);
    try {
      await posthogCaptureEvent("user.signup.attempt", { email, name });
      const message =
        (await signup(email, password, name)) || "Signup successful!";
      setToastMessage(message);
      setToastStatus("success");
      await posthogCaptureEvent("user.signup.success", { email, name });
      await posthogIdentify(email);

      // Redirect to onboarding after successful signup instead of home
      setTimeout(() => {
        history.push("/onboarding");
      }, 1500);
    } catch (error) {
      await posthogCaptureEvent("user.signup.error", {
        error:
          error instanceof Error ? error.message : "Malformed error object!",
      });
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again."
      );
      setToastStatus("danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (event: CustomEvent) => {
    const newValue = event.detail.value ?? "";
    if (event.detail.value !== undefined && newValue !== password) {
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
              <div className="app-logo"></div>
            </div>

            <h1>Create Account</h1>
            <p className="auth-subtitle">Start your journey with us</p>
          </div>

          <div className="auth-form">
            <div className="form-header">Sign up for free</div>

            <IonItem lines="none" className="auth-item">
              <UserIcon className="input-icon" />
              <IonInput
                type="text"
                placeholder="Full Name"
                value={name}
                onIonChange={(e) => setName(e.detail.value!)}
                className="auth-input"
              />
            </IonItem>

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

            <div className="password-requirements">
              <PasswordChecklist
                password={password}
                onValidationChange={setIsPasswordValid}
              />
            </div>

            <IonButton
              expand="block"
              onClick={handleSignup}
              className="auth-button"
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading ? (
                <div className="loading-container">
                  <div className="button-spinner"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create account"
              )}
            </IonButton>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="auth-redirect">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </IonContent>
      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ""}
        duration={3000}
        position="top"
        color={toastStatus || "danger"}
        onDidDismiss={() => {
          setToastMessage(null);
          setToastStatus(null);
        }}
      />
    </IonPage>
  );
};

export default Signup;
