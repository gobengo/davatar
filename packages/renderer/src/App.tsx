import * as React from "react";
import {HashRouter,Link,Route,Switch, useHistory, useLocation, useRouteMatch} from "react-router-dom";
import AuthenticationRequestReceiverScreen from "./components/AuthenticationRequestReceiverScreen";
import { useElectron } from "./use/electron";

function Home() {
    const [latestOpenUrlEvent, setLatestOpenUrlEvent] = React.useState<string|undefined>();
    const { onOpenUrl } = useElectron();
    const history = useHistory();
    React.useEffect(
        () => {
            const subscription = onOpenUrl(url => {
                setLatestOpenUrlEvent(url)
            })
            return () => {
                subscription.unsubscribe()
            }
        },
        []
    )
    React.useEffect(
        () => {
            if ( ! latestOpenUrlEvent) { return }
            const openedUrl = new URL(latestOpenUrlEvent);
            function isSIOPAuthenticationRequest(url: URL) {
                return url.searchParams.get('response_type')
            }
            if (isSIOPAuthenticationRequest(openedUrl)) {
                const searchParams = new URLSearchParams(openedUrl.searchParams.entries())
                const authenticationRequestUrl = `/authentication-request?${searchParams.toString()}`
                history.push(authenticationRequestUrl)
            }
        },
        [latestOpenUrlEvent, history]
    )
    return <>
        WIP: Home Page {location.pathname}
    </>
}

function RouteInfo() {
    const location = useLocation()
    return <>
        <p>Location: {location.pathname}</p>
    </>
}

function App() {

    return <>
        <header>
            <h1>davatar</h1>
        </header>
        <HashRouter>
            <RouteInfo />
            <Route exact path="/" component={Home}/>
            <Route exact path="/authentication-request" component={AuthenticationRequestReceiverScreen}/>
        </HashRouter>
    </>
}

export default App;
