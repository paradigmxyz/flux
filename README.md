<div align="center">
  <h1 align="center">Flux</h1>
  <p align="center">
    Graph-based LLM power tool for exploring many completions in parallel.
    <br />
    <br />
    <a href="https://twitter.com/transmissions11/status/1640775967856803840">Announcement</a>
    ·
    <a href="http://flux.paradigm.xyz">Try Online</a>
    ·
    <a href="https://github.com/paradigmxyz/flux/issues">Report a Bug</a>
  </p>
</div>

<br />

![A screenshot of a Flux workspace.](/public/meta-full.png)

## About

Flux is a power tool for interacting with large language models (LLMs) that **generates multiple completions per prompt in a tree structure and lets you explore the best ones in parallel.**

Flux's tree structure allows you to:

- Get a wider variety of creative responses

- Test out different prompts with the same shared context

- Use inconsistencies to identify where the model is uncertain

It also provides a robust set of keyboard shortcuts, allows setting the system message and editing GPT messages, autosaves to local storage, uses the Anthropic API directly, and is 100% open source and MIT licensed.

## Usage

Visit [flux.paradigm.xyz](https://flux.paradigm.xyz) to try Flux online or follow the instructions below to run it locally.

## Running Locally

```sh
git clone https://github.com/paradigmxyz/flux.git
npm install
npm run dev
```

To run Claude branch locally, you will also need to [utilize this CORS proxy](https://github.com/garmeeh/local-cors-proxy). Once downloaded, you can run the command `lcp --proxyUrl https://api.anthropic.com` in another terminal window before using the API.

## Contributing

See the [open issues](https://github.com/paradigmxyz/flux/issues) for a list of proposed features (and known issues).
