import * as React from "react";
import {HashRouter,Link,Route,Switch, useHistory, useLocation, useRouteMatch} from "react-router-dom";
import AuthenticationRequestReceiverScreen from "./components/AuthenticationRequestReceiverScreen";
import { useElectron } from "./use/electron";

function Home() {
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

function useOpenUrlEvents() {
    const [latestOpenUrlEvent, setLatestOpenUrlEvent] = React.useState<string|undefined>();
    const { onOpenUrl } = useElectron();
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
    return latestOpenUrlEvent
}

function AuthenticationRequestRouter() {
    const history = useHistory()
    const openUrlEvent = useOpenUrlEvents()
    React.useEffect(
        () => {
            if ( ! openUrlEvent) { return }
            const openedUrl = new URL(openUrlEvent);
            function isSIOPAuthenticationRequest(url: URL) {
                return url.searchParams.get('response_type')
            }
            if (isSIOPAuthenticationRequest(openedUrl)) {
                const searchParams = new URLSearchParams(Array.from(openedUrl.searchParams.entries()))
                const authenticationRequestUrl = `/authentication-request?${searchParams.toString()}`
                history.push(authenticationRequestUrl)
            }
        },
        [openUrlEvent, history]
    )
    return <>
    </>
}

function App() {
    return <>
        <header>
            <h1>davatar</h1>
        </header>
        <HashRouter>
            <AuthenticationRequestRouter />
            <RouteInfo />
            <Route exact path="/" component={Home}/>
            <Route exact path="/authentication-request" component={AuthenticationRequestReceiverScreen}/>
        </HashRouter>
    </>
}

export default App;
