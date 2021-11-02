import * as React from 'react';
import { Link } from 'react-router-dom';

export default function DavatarHomeScreen() {
  const appName = 'davatar';
  return (
    <>
      <h1 id="bentest">{appName}</h1>
      <p>{appName} is an identity wallet.</p>
      <ul>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
      </ul>
      <details>
        <summary>How it Works</summary>
        <h2>How it Works</h2>
        <ul>
          <li>
            This app should be opened by other apps that want to learn about you
            and the digital services you interact with. Those{' '}
            <em>Relying Party Apps</em> should open the wallet via{' '}
            <a
              target="_blank"
              href="https://openid.bitbucket.io/connect/openid-connect-self-issued-v2-1_0.html"
            >
              did-siop
            </a>
          </li>
        </ul>
      </details>
    </>
  );
}
