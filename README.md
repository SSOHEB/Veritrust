# Veritrust

> **Trust, verified.** A decentralized job marketplace connecting top talent with verifiable companies.

## 🚀 Overview

Veritrust is a next-generation hiring platform that bridges the gap between Web2 recruitment and Web3 verification. It ensures that candidate profiles, company details, and job applications are transparent and tamper-proof using blockchain technology.

By combining the ease of **Firebase** for real-time data with **Smart Contracts** for critical state verification, Veritrust creates a hiring ecosystem where trust is built-in.

## ✨ Key Features

### For Candidates
*   **Verified Profiles**: Build a professional profile with on-chain verification of skills and history.
*   **Smart Job Search**: Find roles that match your verified credentials.
*   **Application Tracking**: Real-time status updates on your applications, backed by immutable blockchain events.

### For Companies
*   **Authentic Listings**: Post jobs that are verified on-chain, attracting high-quality talent.
*   **Streamlined Dashboard**: Manage applications and candidate pipelines efficiently.
*   **Trust Score**: Earn reputation through verified hiring history and transparency.

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite, TypeScript
*   **Styling**: Tailwind CSS v4, Radix UI
*   **Backend Services**: Firebase (Authentication, Firestore, Functions)
*   **Blockchain Integration**: Viem (Ethereum/EVM interactions)
*   **State Management**: React Context

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/veritrust.git
    cd veritrust
    ```

2.  **Install dependencies**
    ```bash
    cd client
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `client` directory with your Firebase configuration keys.
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

## 📄 Smart Contracts

Veritrust uses a smart contract system to handle:
*   `CandidateRegistered`
*   `CompanyRegistered`
*   `JobPosted`
*   `ApplicationSubmitted`
*   `ApplicationStatusUpdated`

This ensures that the "hiring handshake" is permanently recorded and verifiable.

## 👥 Team

Built with ❤️ for the Hackathon.
