export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isOnboarded?: boolean;
  preferences?: {
    interestsDescription?: string;
    subscribedTopics?: string[];
    trackingConsent?: boolean;
  };
}
