# LiveKit React Astro

This is a simple port of [LiveKit Meet](https://github.com/livekit/meet) to [Astro](https://astro.build/).

NOTE: SSL is required for LiveKit Cloud to work. You can use a self-signed certificate for development.

If you run it on localhost, without ssl, use the livekit-server --dev

You can join a room by visiting top level  https://localhost:4321 or you can give the room a name by visiting https://localhost:4321/room/your-room-name

## Tech Stack

- [Astro](https://astro.build/)
- [LiveKit Components](https://github.com/livekit/components-js/)
- [LiveKit Cloud](https://cloud.livekit.io/)


## Dev Setup

Steps to get a local dev setup up and running:

Start livekit dev server. Install livekit-server from 
https://docs.livekit.io/home/self-hosting/server-setup/

1. Run the livekit server in the background:

```sh
livekit-server --dev
```

Run the front end astro app:

1. Run `pnpm install` to install all dependencies.
2. Copy `env.example` in the project root and rename it to `.env.local`.
3. Update the missing environment variables in the newly created `.env.local` file. For local testing you can just use the default values form the `env.example` file. 
4. Run `pnpm dev` to start the development server and visit [http://localhost:4321](http://localhost:4321) to see the result.
5. Start development 🎉



<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# LiveKit Meet

<p>
  <a href="https://meet.livekit.io"><strong>Try the demo</strong></a>
  •
  <a href="https://github.com/livekit/components-js">LiveKit Components</a>
  •
  <a href="https://docs.livekit.io/">LiveKit Docs</a>
  •
  <a href="https://livekit.io/cloud">LiveKit Cloud</a>
  •
  <a href="https://blog.livekit.io/">Blog</a>
</p>

<br>

LiveKit Meet is an open source video conferencing app built on [LiveKit Components](https://github.com/livekit/components-js), [LiveKit Cloud](https://cloud.livekit.io/), and Next.js. It's been completely redesigned from the ground up using our new components library.

![LiveKit Meet screenshot](./.github/assets/livekit-meet.jpg)



# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
