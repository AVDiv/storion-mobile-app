import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonInput,
  IonToast,
  IonChip,
  IonIcon,
  IonToggle,
  useIonViewDidEnter,
  useIonViewDidLeave,
  IonSpinner,
  IonAlert,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { closeCircle } from "ionicons/icons";
import "./styles/Onboarding.css";
import { useAuth } from "../services/auth/authContext";
import {
  posthogCaptureEvent,
  posthogPageleaveCaptureEvent,
  posthogPageviewCaptureEvent,
} from "../services/analytics/posthogAnalytics";

// Mock data for suggested topics
const suggestedTopics = [
  "Technology",
  "Science",
  "Business",
  "Politics",
  "Health",
  "Sports",
  "Entertainment",
  "Art",
  "Food",
  "Travel",
  "Fashion",
  "Music",
  "Movies",
  "Books",
  "Gaming",
];

const Onboarding: React.FC = () => {
  const [description, setDescription] = useState("");
  const [searchTopic, setSearchTopic] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [trackingConsent, setTrackingConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExitAlertOpen, setIsExitAlertOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const { user, completeOnboarding, getOnboardingData, needsOnboarding } =
    useAuth();
  const history = useHistory();

  // Load any existing onboarding data
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        const data = await getOnboardingData();
        if (data) {
          setDescription(data.description || "");
          setSelectedTopics(data.topics || []);
          setTrackingConsent(data.trackingConsent);
        }
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      } finally {
        setInitialDataLoaded(true);
      }
    };

    if (!initialDataLoaded && user) {
      loadOnboardingData();
    }
  }, [getOnboardingData, initialDataLoaded, user]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      history.replace("/login");
    }
  }, [user, history]);

  // Prevent users from accidentally navigating away from mandatory onboarding
  useEffect(() => {
    if (needsOnboarding && initialDataLoaded) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [needsOnboarding, initialDataLoaded]);

  useIonViewDidEnter(() => {
    posthogPageviewCaptureEvent();
  });

  useIonViewDidLeave(() => {
    posthogPageleaveCaptureEvent();
  });

  const filteredTopics = suggestedTopics.filter(
    (topic) =>
      !selectedTopics.includes(topic) &&
      topic.toLowerCase().includes(searchTopic.toLowerCase())
  );

  const handleTopicSelect = (topic: string) => {
    if (!selectedTopics.includes(topic)) {
      setSelectedTopics([...selectedTopics, topic]);
    }
    setSearchTopic("");
  };

  const handleTopicRemove = (topic: string) => {
    setSelectedTopics(selectedTopics.filter((t) => t !== topic));
  };

  const handleSubmit = async () => {
    // Validate required fields according to API docs
    if (selectedTopics.length === 0) {
      setToastMessage("Please select at least one topic of interest");
      return;
    }

    setIsLoading(true);
    try {
      // Track event in analytics
      await posthogCaptureEvent("onboarding.completed", {
        description,
        selectedTopics,
        trackingConsent,
      });

      // Save preferences through auth context
      await completeOnboarding({
        description,
        topics: selectedTopics,
        trackingConsent,
      });

      setToastMessage("Preferences saved successfully!");

      // After short delay redirect to home page
      setTimeout(() => {
        history.replace("/home");
      }, 1000);
    } catch (error) {
      console.error("Onboarding error:", error);
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Failed to save preferences. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (needsOnboarding) {
      setIsExitAlertOpen(true);
    } else {
      history.replace("/home");
    }
  };

  return (
    <IonPage className="onboarding-page">
      <div className="onboarding-background">
        <div className="onboarding-decoration"></div>
      </div>
      <IonContent fullscreen className="ion-padding">
        <div className="onboarding-container">
          <div className="onboarding-header">
            <div className="logo-container">
              <div className="app-logo"></div>
            </div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="onboarding-subtitle">
              Tell us about yourself so we can personalize your experience
            </p>
          </div>

          <div className="onboarding-steps">
            <div className="onboarding-step">
              <h2>Step 1: Describe Your Interests</h2>
              <p className="step-description">
                Tell us a bit about yourself and what kind of content you're
                interested in.
              </p>
              <IonItem lines="none" className="onboarding-item textarea-item">
                <IonTextarea
                  placeholder="I'm interested in technology trends, science discoveries, and love to keep up with the latest business news..."
                  value={description}
                  onIonChange={(e) => setDescription(e.detail.value || "")}
                  className="interests-textarea"
                  rows={4}
                  autoGrow
                />
              </IonItem>
            </div>

            <div className="onboarding-step">
              <h2>Step 2: Follow Topics</h2>
              <p className="step-description">
                Select topics you want to follow for a personalized feed.
                <strong> (Required) </strong>
              </p>
              <IonItem lines="none" className="onboarding-item">
                <IonInput
                  placeholder="Search for topics..."
                  value={searchTopic}
                  onIonChange={(e) => setSearchTopic(e.detail.value || "")}
                  className="topic-input"
                />
              </IonItem>

              {searchTopic && filteredTopics.length > 0 && (
                <div className="topic-suggestions">
                  {filteredTopics.slice(0, 5).map((topic) => (
                    <div
                      key={topic}
                      className="topic-suggestion-item"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              )}

              <div className="selected-topics">
                {selectedTopics.map((topic) => (
                  <IonChip
                    key={topic}
                    className="topic-chip"
                    onClick={() => handleTopicRemove(topic)}
                  >
                    <IonLabel>{topic}</IonLabel>
                    <IonIcon icon={closeCircle} />
                  </IonChip>
                ))}

                {selectedTopics.length === 0 && (
                  <p className="no-topics-message">
                    Please search and select at least one topic
                  </p>
                )}
              </div>
            </div>

            <div className="onboarding-step">
              <h2>Step 3: Usage Tracking</h2>
              <p className="step-description">
                We can improve your experience by tracking how you use our app.
                <strong> (Required) </strong>
              </p>
              <IonItem lines="none" className="consent-toggle">
                <IonLabel>
                  <h3>Allow usage tracking</h3>
                  <p>
                    We'll collect anonymous data to improve your experience and
                    provide better content recommendations.
                  </p>
                </IonLabel>
                <IonToggle
                  checked={trackingConsent}
                  onIonChange={() => setTrackingConsent(!trackingConsent)}
                  slot="end"
                />
              </IonItem>
            </div>

            <IonButton
              expand="block"
              onClick={handleSubmit}
              className="onboarding-button"
              disabled={isLoading || selectedTopics.length === 0}
            >
              {isLoading ? (
                <div className="loading-container">
                  <IonSpinner name="crescent" />
                  <span>Saving preferences...</span>
                </div>
              ) : (
                "Get Started"
              )}
            </IonButton>

            {!needsOnboarding && (
              <p className="skip-text">
                <a onClick={handleSkip}>Skip for now</a>
              </p>
            )}
          </div>
        </div>
      </IonContent>

      <IonAlert
        isOpen={isExitAlertOpen}
        onDidDismiss={() => setIsExitAlertOpen(false)}
        header="Onboarding Required"
        message="You need to complete onboarding before you can access the application. Please select your interests and preferences to continue."
        buttons={[
          {
            text: "OK",
            role: "cancel",
          },
        ]}
      />

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ""}
        duration={3000}
        position="top"
        color={
          toastMessage?.includes("Failed") ||
          toastMessage?.includes("Please select")
            ? "danger"
            : "success"
        }
        onDidDismiss={() => setToastMessage(null)}
      />
    </IonPage>
  );
};

export default Onboarding;
