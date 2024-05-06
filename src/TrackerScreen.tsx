import React, {useEffect, useState} from "react";
import PlusIcon from "./assets/2795.svg";
import BooksIcon from './assets/1F4DA.svg';
import WarningIcon from './assets/26A0.svg';
import CheckmarkIcon from './assets/2714.svg';
import CrossIcon from './assets/274C.svg';
import {Achievement, Criteria, CriteriaObject} from "./Interfaces";
import AchievementBlock from "./components/AchievementBlock";

import {deleteUserSession, UnauthorizedError, wu} from "./helpers";
import Planner from "./components/Planner";
import ErrorModal from "./components/ErrorModal";


interface TrackerScreenProps {
    accessToken: string;
    allAchievements: any[];
    achievement_id: number;
    onUntrack: () => void;
}

interface LocalAchievement {
    id: number;
    title: string;
    iconUrl: string;
    description: string;
    tracked: boolean;
    criteria?: any[],
}

interface Character {
    id: string;
    name: string;
    realm: string;
    iconUrl: string;
    classTitle: string;
    race: string;
    race_id: number;
    lvl: string;
    characterUrl: string;
}

interface CharacterAchievementsContextType {
    isLoading: boolean;
    achievements: Achievement[];
}

const CharacterAchievementsContext = React.createContext<CharacterAchievementsContextType | undefined>(undefined);


interface CharacterAchievementsProviderProps {
    children: React.ReactNode;
    isLoading: boolean;
    achievements: Achievement[];
}

const CharacterAchievementsProvider: React.FC<CharacterAchievementsProviderProps> = ({
                                                                                         children,
                                                                                         isLoading,
                                                                                         achievements
                                                                                     }) => {

    return <CharacterAchievementsContext.Provider value={{isLoading, achievements}}>
        {children}
    </CharacterAchievementsContext.Provider>
}

export const useCharacterAchievements = () => {
    const context = React.useContext(CharacterAchievementsContext);
    if (context === undefined) {
        throw new Error('useCharacterAchievements must be used within a CharacterAchievementsProvider');
    }
    return context;
}

const TrackerScreen = (props: TrackerScreenProps) => {
    const [achievement, setAchievement] = useState<LocalAchievement | null>(null);
    const [character, setCharacter] = useState<Character | null>(null);
    const [isTracked, setIsTracked] = useState(false);
    const [allAchievements, setAllAchievements] = useState<any[]>([]);
    const {
        clientId,
        clientSecret,
        characterName,
        realmName,
        save_credentials
    } = JSON.parse(localStorage.getItem('wowTrackerUserData') || '{}');

    const [isPlannerOpen, setIsPlannerOpen] = useState<boolean>(false);

    const [achievementTree, setAchievementTree] = useState({});

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [expanded, setExpanded] = useState<boolean>(false);

    const [error, setError] = useState<string>('');

    useEffect(() => {

        // fetch all achievements
        fetch(`https://us.api.blizzard.com/profile/wow/character/${realmName}/${characterName}/achievements?namespace=profile-us&locale=en_US`,
            {headers: {'Authorization': 'Bearer ' + props.accessToken}}).then((response) => {
            if (response.status === 401) {
                throw new UnauthorizedError('Invalid access token');
            } else if (response.status !== 200) {
                throw new Error('Something went wrong, check logs');
            } else {
                return response.json();
            }
        }).then((data) => {
            setAllAchievements(data.achievements);
        }).catch((error) => {
            if (error instanceof UnauthorizedError) {
                setError(error.message);
            } else {
                setError('Something went wrong, check logs');
            }
        })

        // load achievement and
        fetchAchievement(props.achievement_id).then((data) => {
            // fetch media
            setAchievement(prevState => ({
                ...prevState,
                id: data.id,
                title: data.name,
                description: data.description,
                criteria: data.criteria
            } as LocalAchievement));


            loadRequirements(data.id).then((data: any) => {
                setAchievementTree(data);
                setIsLoading(false);
            });

            // fetch media
            fetch(`https://us.api.blizzard.com/data/wow/media/achievement/${props.achievement_id}?namespace=static-us&locale=en_US`, {
                headers: {
                    'Authorization': 'Bearer ' + props.accessToken,
                }
            }).then((response) => {
                if (response.status === 401) {
                    throw new UnauthorizedError('Invalid access token');
                } else if (response.status !== 200) {
                    throw new Error('Something went wrong, check logs');
                } else {
                    return response.json();
                }
            }).then((data) => {
                if (data.assets.length > 0) {
                    setAchievement(prevState => ({
                        ...prevState,
                        iconUrl: data.assets[0].value
                    } as LocalAchievement));
                }
            }).catch((error) => {
                if (error instanceof UnauthorizedError) {
                    setError(error.message);
                } else {
                    setError('Something went wrong, check logs');
                }
            })
        }).catch((error) => {
            if (error instanceof UnauthorizedError) {
                setError(error.message);
            } else {
                setError('Something went wrong, check logs');
            }
        })


        // load character

        fetch(`https://us.api.blizzard.com/profile/wow/character/${realmName}/${characterName}?namespace=profile-us&locale=en_US`,
            {headers: {'Authorization': 'Bearer ' + props.accessToken}}).then((response) => {
            if (response.status === 401) {
                throw new UnauthorizedError('Invalid access token');
            } else if (response.status !== 200) {
                throw new Error('Something went wrong, check logs');
            } else {
                return response.json();
            }
        }).then((data) => {
            setCharacter(prevState => ({
                ...prevState,
                id: data.id,
                name: data.name,
                realm: data.realm.name,
                classTitle: data.active_spec.name + " " + data.character_class.name,
                classId: data.character_class.id,
                race: data.race.name,
                race_id: data.race.id,
                lvl: data.level,
                characterUrl: `https://worldofwarcraft.blizzard.com/en-us/character/us/${realmName}/${characterName}`
            } as Character));

            fetch(`https://us.api.blizzard.com/data/wow/media/playable-class/${data.character_class.id}?namespace=static-us&locale=en_US`,
                {headers: {'Authorization': 'Bearer ' + props.accessToken}}).then(response => response.json()).then((mediaData) => {
                if (mediaData.assets) {
                    setCharacter(prevState => ({
                        ...prevState,
                        iconUrl: mediaData.assets[0].value
                    } as Character));
                }
            });
        }).catch((error) => {
            if (error instanceof UnauthorizedError) {
                setError(error.message);
            } else {
                setError('Something went wrong, check logs');
            }
        })

        //

        const tracked_achievement_id = localStorage.getItem('wowTrackerAchievementId');
        if (tracked_achievement_id && parseInt(tracked_achievement_id) === props.achievement_id) {
            setIsTracked(true);
        }
    }, []);


    const fetchAchievement = (id: number) => {
        return fetch(`https://us.api.blizzard.com/data/wow/achievement/${id}?namespace=static-us&locale=en_US&accessToken=${props.accessToken}`, {
            headers: {
                'Authorization': 'Bearer ' + props.accessToken
            }
        }).then(response => {
            if (response.status === 401) {
                throw new UnauthorizedError('Invalid access token');
            } else if (response.status !== 200) {
                throw new Error('Something went wrong, check logs');
            } else {
                return response.json();
            }
        })
    }

    const fetchAchievementMedia = (id: number) => {
        return fetch(`https://us.api.blizzard.com/data/wow/media/achievement/${id}?namespace=static-us&locale=en_US`, {
            headers: {
                'Authorization': 'Bearer ' + props.accessToken
            }
        }).then(response => {
            if (response.status === 401) {
                throw new UnauthorizedError('Invalid access token');
            } else if (response.status !== 200) {
                throw new Error('Something went wrong, check logs');
            } else {
                return response.json();
            }
        })
    }

    const loadRequirements = async (achievementId: number): Promise<Achievement> => {
        const response = await fetchAchievement(achievementId);

        // Check if there are criteria and child criteria
        if (response.criteria && response.criteria.child_criteria) {
            // Map through each child criteria
            const childCriteriaPromises = response.criteria.child_criteria.map(async (child: any) => {
                if (child.achievement) {
                    // Recursively load the full achievement details for the child
                    child.achievement = await loadRequirements(child.achievement.id);
                }
                return child;
            });

            // Await all the promises from the map (this ensures all data is loaded)
            response.criteria.child_criteria = await Promise.all(childCriteriaPromises);
        }
        response.media = await fetchAchievementMedia(achievementId);
        return response;
    };


    const toggleIsTracked = () => {
        if (isTracked) {
            localStorage.removeItem('wowTrackerAchievementId');
            setIsTracked(false);
        } else {
            localStorage.setItem('wowTrackerAchievementId', props.achievement_id.toString());
            setIsTracked(true);
        }
    }


    const renderRequirements = () => {
        if ((achievementTree as any).criteria && (achievementTree as any).criteria.child_criteria) {
            return (achievementTree as any).criteria.child_criteria.map((criteria: any) => {
                return <div key={criteria.id}><AchievementBlock  title={criteria.achievement.name}
                                         iconUrl={criteria.achievement.media.assets[0].value}
                                         data={criteria}
                                         forceOpen={expanded}
                />
                </div>
            });
        }

        return <></>
    }

    const startPlanner = () =>
    {
        alert("Planner is a WIP, not implemented yet");
        setIsPlannerOpen(true)
    }




    return <CharacterAchievementsProvider isLoading={isLoading} achievements={allAchievements}>
        <div>
            <div className={'tracker-header'}>
                <div className={'parent-achievement-data'}>
                    <img src={achievement?.iconUrl}/>
                    <h2><a href={wu(achievement?.id)} target="_blank" rel="noopener noreferrer">{achievement?.title}</a>
                    </h2>
                    <p>{achievement?.description}</p>
                </div>
                <div className={'character-data'}>
                    <img
                        src={character?.iconUrl}/>
                    <h3><a href={character?.characterUrl} target="_blank"
                           rel="noopener noreferrer">{character?.name}</a>
                    </h3>
                    <p>Level {character?.lvl} {character?.classTitle}</p>
                </div>
            </div>
            <hr/>
            <div className={'action-bar'}>
                <button disabled={isLoading} onClick={toggleIsTracked} className="outline contrast"><img
                    src={isTracked ? CheckmarkIcon : WarningIcon}/> <span>{isTracked ? "Untrack" : "Track"}</span>
                </button>
                <button disabled={isLoading} onClick={() => startPlanner()} className="outline contrast"><img
                    src={BooksIcon}/> AI Planner
                </button>
                <button disabled={isLoading} onClick={() => setExpanded(!expanded)} className="outline contrast"><img src={PlusIcon}/> Expand All</button>
                <button disabled={isLoading} onClick={deleteUserSession} className="outline contrast"><img src={CrossIcon}/> Delete Session</button>

            </div>
            <hr/>
            { isPlannerOpen ? <></>: null}

            {!isTracked ? <article className={'alert'}>This achievement is not tracked. Click the track button to keep track of it. You can only track 1 achievement at a time, but you can preview as many as you like in a new tab.</article> : null}
            <div className={'achievements-list'}>
                {isLoading ? <article aria-busy={true}>Loading...</article> : renderRequirements()}
            </div>
            <ErrorModal open={error.length > 0} message={error} onClose={deleteUserSession} />
        </div>
    </CharacterAchievementsProvider>
}
export default TrackerScreen;
