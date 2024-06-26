import React, {useState} from "react";
import {UnauthorizedError} from "./helpers";
import ErrorModal from "./components/ErrorModal";
import LogoImage from "./assets/logo.svg";

interface SetupScreenProps {
    onAccessTokenCreated: (accessToken: string) => void;
}



const SetupScreen = (props: SetupScreenProps) => {

    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [realmName, setRealmName] = useState('');
    const [saveCredentials, setSaveCredentials] = useState(true);

    const [aiUrl, setAiUrl] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (!clientId || !clientSecret || !characterName || !realmName) {
            setError('All fields are required');
            setIsLoading(false);
            return;
        }
        if (saveCredentials) {
            localStorage.setItem('wowTrackerUserData', JSON.stringify({
                clientId: clientId.trim(),
                clientSecret: clientSecret.trim(),
                characterName: characterName.toLowerCase().trim(),
                realmName: realmName.toLowerCase().trim(),
                aiUrl: aiUrl
            }));
        }

        validateCredentials(clientId, clientSecret);
    }

    const validateCredentials = (clientId: string, clientSecret: string) => {
        const requestHeaders = new Headers({
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
        });

        fetch('https://oauth.battle.net/token?grant_type=client_credentials', {
            method: 'POST',
            headers: requestHeaders
        }).then(response => response.json()).then((data) => {
            if ('access_token' in data) {
                const token = data.access_token;
                localStorage.setItem('wowTrackerAccessToken', token);
                props.onAccessTokenCreated(token);
            } else {
               throw new UnauthorizedError('Invalid credentials');
            }
        }).catch((error) => {
            if (error instanceof UnauthorizedError) {
                setError(error.message + "\nPlease check the client id and client secret.");
            }
            else {
                setError('Something went wrong, check logs');
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="setup-screen">
            <div className={'logo'}>
                <img src={LogoImage} />
                <h3>WoW Achievement Tracker</h3>
            </div>
            <article>
                <p>You will need to create an application on the Blizzard Developer Portal to get your client ID and
                    client secret. </p>
                <p> Follow this link to create an application: <a
                    href="https://develop.battle.net/documentation/guides/getting-started"
                    target="_blank">https://develop.battle.net/documentation/guides/getting-started</a>.</p>
            </article>
            <form onSubmit={(e) => submitForm(e)}>
                <fieldset>
                    <input type="text" name="clientId" placeholder="Client ID"
                           onChange={(e) => setClientId(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input type="text" name="clientSecret" placeholder="Client Secret"
                           onChange={(e) => setClientSecret(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input type="text" name="characterName" placeholder="Character Name"
                           onChange={(e) => setCharacterName(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input type="text" name="realmName" placeholder="Realm Name"
                           onChange={(e) => setRealmName(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input id="saveCredentials" type="checkbox" name="saveCredentials"
                           onChange={(e) => setSaveCredentials(e.target.checked)}/>
                    <label htmlFor="saveCredentials">Save Credentials?</label>
                </fieldset>
                <article>
                    All settings will be saved to your local storage, no credentials will be sent to any server. <br />
                    Source code of this project and all dependencies can be found on <a href="https://github.com/Zenger/wow-achievement-tracker" target="_blank">GitHub</a>.
                </article>
                <hr/>
                <fieldset>
                    <input type="text" name="aiUrl" placeholder="AI URL"
                           onChange={(e) => setAiUrl(e.target.value)}/>
                </fieldset>
                <p>Optionally include a server url to generate ai suggestions, {`\{id\}`} will be replaced with the achievement id. e.g https://myserver.com/ai-planner/{`\{id\}`}/suggestions</p>

                {error && <ErrorModal open={error.length > 0} message={error} onClose={() => { setError('') }} />}
                <fieldset>
                    <input aria-busy={isLoading} type="submit" value="Save" disabled={isLoading}/>
                </fieldset>
            </form>
            <p>Icons courtesy of <a href={"https://openmoji.org/"}>Open Emoji</a>.</p>
        </div>
    )
};
export default SetupScreen;
