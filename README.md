# Printera Server

Printera Server is an open-source backend infrastructure designed for the Printera ecosystem. It handles essential data relations and provides a robust API to interact with, mutate, and query the data. Through its interactions with AWS services, Printera Server ensures efficient resource management and provisioning.

## Overview

- **Interactions with AWS**: Printera Server leverages the AWS SDK to create and manage various AWS resources, such as IAM roles & policies and identity roles & policies. This capability ensures that the server can effectively organize permissions and other critical AWS entities.
- **IoT Management**: While Printera Server sets the stage for AWS IoT resources, including creating IoT "things", generating certificates, and organizing roles and policy permissions, the real-time interaction between 3D printers and frontend clients is facilitated by the frontend directly connecting to AWS IoT MQTT topics.

## Tech Stack

- **Nest.js**: A progressive Node.js framework for scalable and maintainable server-side applications.
- **Typescript**: Offers static typing for a robust and error-free codebase.
- **Drizzle ORM (with MySQL2 Driver)**: Defines and manages data relations in a type-safe manner with MySQL.
- **AWS SDK**: The backbone for programmatic interactions with AWS services.

## Getting Started

<!-- Add setup, installation instructions, and any prerequisites here -->

## Usage

<!-- Describe how to use the project, integrate it, or set it up for development -->

## How to Contribute

We welcome contributions from the community! If you're interested:

1. Fork this repository.
2. Make your changes.
3. Submit a pull request.

For more detailed instructions, please refer to our `CONTRIBUTING.md` (if available).

## Code of Conduct

To ensure a positive environment for our contributors, please review our `CODE_OF_CONDUCT.md` (if available).

## License

This project is licensed under the [MIT License](LICENSE). This allows you to use, modify, and distribute the code in your own projects, as long as you provide attribution back to this project and don’t hold the project maintainers liable.
