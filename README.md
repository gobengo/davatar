# davatar

Decentralized Avatars.

## Status

Early work in progress and experimental.
* The interface isn't yet intentionally styled or organized.

## Overview

### What?

This is a cross-platform application for managing a set of identities and [avatars](https://en.wikipedia.org/wiki/Avatar_(computing)) that you can choose to use when participating on the decentralized web (aka [dweb](https://getdweb.net/)).

In the context of the W3C CCG [Universal Wallet Interop Spec](https://w3c-ccg.github.io/universal-wallet-interop-spec/), this is a [Native Application](https://w3c-ccg.github.io/universal-wallet-interop-spec/#native-mobile-applications) identity allet, but for desktop OS.

### Why?

Humans should be able to participate on the web and in metaverses using identities that they control, not only identities controlled by institutions that aren't entirely accountable to the identified humans (e.g. privately owned corporations).

via [Microsoft](https://www.microsoft.com/en-us/security/business/identity-access-management/decentralized-identity-blockchain):

> Why is decentralized identity important?
>
> As our lives are increasingly linked to apps, devices, and services, we’re often subject to data breaches and privacy loss. A standards-based decentralized identity system can provide greater privacy and control over your data.

### How?

Other applications can initiate an authentication using this app by using it as a Self-Issued OpenID Provider (aka [SIOP](https://openid.net/specs/openid-connect-core-1_0.html#SelfIssued)).

## Usage

Use this app by cloning the git repo, then running `npm watch` to run the app. This should open a new app window in your OS's window manager.

### Then What?

* Try using the 'Oidc Tester' by navigating to it from the menu in the footer
* TODO: make it more obvious how to use this app when not opened via an 'openid:' protocol handler

## Thanks to

* https://identity.foundation/
* [Electron](https://www.electronjs.org/)
* https://github.com/cawa-93/vite-electron-builder
