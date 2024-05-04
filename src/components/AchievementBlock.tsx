import React, {useEffect} from "react";
import {Achievement, Criteria} from "../Interfaces";
import CriteriaBlock from "./CriteriaBlock";
import {wu} from "../helpers";
import {useCharacterAchievements} from "../TrackerScreen";

import WarningIcon from '../assets/26A0.svg';

interface AchievementBlockProps {
    title: string;
    iconUrl: string;
    data: any;
    forceOpen: boolean;
}

export interface Completeness {
    totalSteps: number;
    steps: number;
    isCompleted: boolean;
    completedTimestamp: number;
    completedSteps: Criteria[],
    unCompletedSteps: Criteria[],
}

export const extractSteps = (achievementId: number, achievements: Achievement[]): Completeness => {

    let completeness = {
        totalSteps: 1,
        steps: 0,
        isCompleted: false,
        completedTimestamp: 0,
        completedSteps: [],
        unCompletedSteps: [],
    } as Completeness;

    if (achievements) {
        var achievement = achievements.find((a) => a.id === achievementId);
        var completedStepsObject = [] as Criteria[];
        var unCompletedStepsObject = [] as Criteria[];

        if (achievement && achievement.criteria) {


            if (achievement.criteria.completed_timestamp) {
                completeness.isCompleted = achievement.criteria.completed_timestamp > 0;
                completeness.completedTimestamp = achievement.criteria.completed_timestamp;
            } else {
                if (achievement.is_completed) completeness.isCompleted = achievement.is_completed;
                if (achievement.completed_timestamp) {
                    completeness.completedTimestamp = achievement.completed_timestamp;
                    completeness.isCompleted = true;
                }
            }

            let steps = 0;
            let completedSteps = 0;

            if (achievement.criteria.child_criteria) {
                achievement.criteria.child_criteria.forEach((cc) => {
                    steps += 1;
                    completedSteps = cc.is_completed ? completedSteps + 1 : completedSteps;
                    if (cc.is_completed) {
                         completedStepsObject.push(cc as Criteria);
                    } else {
                        unCompletedStepsObject.push(cc as Criteria);
                    }
                });
            }

            completeness.steps = completedSteps;
            completeness.totalSteps = steps === 0 ? 1 : steps;
            completeness.completedSteps = completedStepsObject;
            completeness.unCompletedSteps = unCompletedStepsObject;
        }
    }
    return completeness as Completeness;
}

const AchievementBlock = (props: AchievementBlockProps) => {


    const [completeness, setCompleteness] = React.useState<Completeness>({} as Completeness);
    const [accountWideWarning, setAccountWideWarning] = React.useState(false);

    const characterAchievementsData = useCharacterAchievements();

    const [isOpen, setIsOpen] = React.useState(false);
    const [forceOpen, setForceOpen] = React.useState(false);

    useEffect(() => {
        var steps = extractSteps(props.data.achievement.id, characterAchievementsData.achievements);
        setCompleteness(steps);
        if (steps.isCompleted && steps.totalSteps !== steps.steps) {
            setAccountWideWarning(true);
        }
    }, []);
    const toggleHeader = () => {
        setIsOpen(!isOpen);
    }

    useEffect(() => {
        if (props.forceOpen) {
            setIsOpen(true);
        }
    }, [props.forceOpen]);



    const renderCriteria = () => {

        if (props.data.achievement.criteria && props.data.achievement.criteria.child_criteria) {
            return <div>{props.data.achievement.criteria.child_criteria.map((criteria: any) => {
                return <CriteriaBlock key={criteria.id} description={criteria.description} criteria={criteria}
                                      completeness={completeness} forceOpen={forceOpen}
                />
            })}
            </div>
        }
    }
    return <div className={`achievement-wrapper ${completeness.isCompleted ? "is-completed" : ""}`}>
        <div onClick={() => toggleHeader()} className={'achievement-header'}>
            <div className={'icon'}>
                <a onClick={(e) => {
                    e.preventDefault();
                    toggleHeader()
                }} href={wu(props.data.achievement.id)} target="_blank" rel="noopener noreferrer"><img
                    src={props.iconUrl}/></a>
            </div>
            <div className={'title'}>
                <a onClick={(e) => {
                    e.preventDefault();
                    toggleHeader()
                }} href={wu(props.data.achievement.id)} target="_blank" rel="noopener noreferrer">{props.title}</a>
            </div>
            <div className={'completion'}>
                {accountWideWarning ?
                    <em data-tooltip={"This achievement is completed, however the steps shown here are counted for the current character."}><img
                        src={WarningIcon}

                        style={{width: "20px"}}/></em> : ""}<span>{`[${completeness.steps}/${completeness.totalSteps}]`}</span>
            </div>
        </div>
        {isOpen ? <div className={'achievement-container'}>
            <p>{props.data.achievement.description}</p>
            {renderCriteria()}
        </div> : null}
    </div>
}


export default AchievementBlock;
