import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import SetupScreen from "./SetupScreen";
import AchievementsScreen from "./AchievementsScreen";
import TrackerScreen from "./TrackerScreen";


function App() {
    const [access_token, setAccessToken] = React.useState<string | null>(null);
    const [achievement_id, setAchievementId] = React.useState<number | null>(null);
    const [achievements, setAchievements] = React.useState<any[]>([]);

    useEffect( () => {
        const token = localStorage.getItem('pain_tracker_access_token');
        const achievement_id = localStorage.getItem('pain_tracker_achievement_id');
        if (token) {
            setAccessToken(token);
        }
        if (achievement_id) {
            setAchievementId(parseInt(achievement_id));
        }
    }, []);
  return (
    <div className="App">
        <div className="container mx-auto px-4">
            {!access_token && <SetupScreen onAccessTokenCreated={(token) => setAccessToken(token)} /> }
            {(access_token && !achievement_id) && <div>
                <AchievementsScreen access_token={access_token} onAchievementsLoaded={(achievements) => setAchievements(achievements)} onAchievementSelected={(achievement) => {
                    setAchievementId(achievement.id);
                }} />
            </div>}
            {(access_token && achievement_id) && <div>
                <TrackerScreen accessToken={access_token} allAchievements={achievements} achievement_id={achievement_id} onUntrack={() => {}} />
            </div>}
        </div>
    </div>
  );
}

export default App;
