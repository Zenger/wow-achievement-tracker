import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import SetupScreen from "./SetupScreen";
import AchievementsScreen from "./AchievementsScreen";
import TrackerScreen from "./TrackerScreen";


function App() {
    const [accessToken, setAccessToken] = React.useState<string | null>(null);
    const [achievement_id, setAchievementId] = React.useState<number | null>(null);
    const [achievements, setAchievements] = React.useState<any[]>([]);

    useEffect( () => {
        const token = localStorage.getItem('wowTrackerAccessToken');
        const achievement_id = localStorage.getItem('wowTrackerAchievementId');
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
            {!accessToken && <SetupScreen onAccessTokenCreated={(token) => setAccessToken(token)} /> }
            {(accessToken && !achievement_id) && <div>
                <AchievementsScreen accessToken={accessToken} onAchievementsLoaded={(achievements) => setAchievements(achievements)} onAchievementSelected={(achievement) => {
                    setAchievementId(achievement.id);
                }} />
            </div>}
            {(accessToken && achievement_id) && <div>
                <TrackerScreen accessToken={accessToken} allAchievements={achievements} achievement_id={achievement_id} onUntrack={() => {}} />
            </div>}
        </div>
    </div>
  );
}

export default App;
