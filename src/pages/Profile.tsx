import React from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonList,
} from "@ionic/react";
import { exitOutline, settingsOutline } from "ionicons/icons";
import { useAuth } from "../services/auth/authContext";
import { useHistory } from "react-router-dom";
import "./styles/Profile.css";

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSettings = () => {
    history.push("/settings");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSettings}>
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="profile-content">
        {user && (
          <>
            <div className="profile-header">
              <IonAvatar className="profile-avatar">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=random`}
                  alt={user.name}
                />
              </IonAvatar>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Account</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="full">
                  <IonItem routerLink="/settings">
                    <IonIcon icon={settingsOutline} slot="start" />
                    <IonLabel>Settings</IonLabel>
                  </IonItem>

                  <IonItem onClick={handleLogout} button detail={false}>
                    <IonIcon icon={exitOutline} slot="start" color="danger" />
                    <IonLabel color="danger">Log Out</IonLabel>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;
