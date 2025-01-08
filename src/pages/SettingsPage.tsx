// import React from "react";
// import { IonContent, IonPage } from "@ionic/react";
// import { TelemetrySwitch } from "../components/TelemetrySwitch";

// const SettingsPage: React.FC = () => {
//   return (
//     <IonPage>
//       <IonContent>
//         <TelemetrySwitch />
//         {/* ...other settings... */}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default SettingsPage;

// Example usage in a settings component:
// import { isTelemetryEnabled, setTelemetryEnabled } from './services/analytics/posthogAnalytics';

// const SettingsComponent = () => {
//   const [telemetryEnabled, setTelemetry] = useState(isTelemetryEnabled());

//   const handleTelemetryToggle = (enabled: boolean) => {
//     setTelemetryEnabled(enabled);
//     setTelemetry(enabled);
//   };

//   return (
//     <IonToggle
//       checked={telemetryEnabled}
//       onIonChange={e => handleTelemetryToggle(e.detail.checked)}
//     >
//       Enable Analytics
//     </IonToggle>
//   );
// };
