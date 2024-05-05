import React, {useState} from "react";

interface SetupScreenProps {
    onAccessTokenCreated: (access_token: string) => void;
}
const SetupScreen = (props: SetupScreenProps) => {

    const [client_id, setClientId] = useState('');
    const [client_secret, setClientSecret] = useState('');
    const [character_name, setCharacterName] = useState('');
    const [realm_name, setRealmName] = useState('');
    const [save_credentials, setSaveCredentials] = useState(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (!client_id || !client_secret || !character_name || !realm_name) {
            alert('All fields are required');
            setIsLoading(false);
            return;
        }
        if (save_credentials) {
            localStorage.setItem('pain_tracker', JSON.stringify({
                client_id: client_id.toLowerCase().trim(),
                client_secret: client_secret.toLowerCase().trim(),
                character_name: character_name.toLowerCase().trim(),
                realm_name: realm_name.toLowerCase().trim(),
                save_credential: save_credentials
            }));
        }

        validateCredentials(client_id, client_secret);
    }

    const validateCredentials = (client_id: string, client_secret: string) => {
        const requestHeaders = new Headers({
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
        });

        fetch('https://oauth.battle.net/token?grant_type=client_credentials', {
            method: 'POST',
            headers: requestHeaders
        }).then(response => response.json()).then((data) => {
            if ('access_token' in data) {
                localStorage.setItem('pain_tracker_access_token', data.access_token);
                props.onAccessTokenCreated(data.access_token);
            } else {
                throw new Error('Invalid credentials');
            }
        }).catch((error) => {
            alert('Invalid credentials or server error check logs');
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="setup-screen">
            <article>
                <p>You will need to create an application on the Blizzard Developer Portal to get your client ID and
                    client secret. </p>
                <p> Follow this link to create an application: <a
                    href="https://develop.battle.net/documentation/guides/getting-started"
                    target="_blank">https://develop.battle.net/documentation/guides/getting-started</a>.</p>
            </article>
            <form onSubmit={(e) => submitForm(e)}>
                <fieldset>
                    <input type="text" name="client_id" placeholder="Client ID"
                           onChange={(e) => setClientId(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input type="text" name="client_secret" placeholder="Client Secret"
                           onChange={(e) => setClientSecret(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input type="text" name="character_name" placeholder="Character Name"
                           onChange={(e) => setCharacterName(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input type="text" name="realm_name" placeholder="Realm Name"
                           onChange={(e) => setRealmName(e.target.value)}/>
                </fieldset>
                <fieldset>
                    <input id="save_credentials" type="checkbox" name="save_credentials"
                           onChange={(e) => setSaveCredentials(e.target.checked)}/>
                    <label htmlFor="save_credentials">Save Credentials?</label>
                </fieldset>
                <article>
                    All settings will be saved to your local storage, no credentials will be sent to any server. <br />
                    Source code of this project and all dependencies can be found on <a href="https://github.com/Zenger/wow-achievement-tracker" target="_blank">GitHub</a>.
                </article>
                <fieldset>
                    <input aria-busy={isLoading} type="submit" value="Save" disabled={isLoading}/>
                </fieldset>
            </form>


        </div>
    )
};
export default SetupScreen;
