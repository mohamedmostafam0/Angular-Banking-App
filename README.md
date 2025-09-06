# Banking UI

A modern, intuitive and responsive UI for a banking application, built with Angular.

**Note:** This project is currently in development. Features and functionalities are subject to change and improvement.

## 📜 Description

This project is a comprehensive banking user interface developed using Angular. It aims to provide a seamless and efficient user experience for performing various banking operations. The application is designed to be modular, scalable, and easy to maintain, leveraging the power of Angular's component-based architecture.

## ✨ Features

The application includes the following features:

- **Dashboard:** An overview of the user's financial status, including account balances, recent transactions, and quick access to common actions.
- **Accounts:** View detailed information about savings and checking accounts, including transaction history.
- **Fund Transfers:**
    - Intra-bank transfers (within the same bank)
    - Domestic transfers
    - International transfers
- **Card Management:**
    - View and manage credit and debit cards.
    - Request new credit cards.
- **Loans:**
    - Apply for new loans.
    - Track the status of existing loan applications.
- **Payments:**
    - Make one-time payments to beneficiaries.
    - Set up and manage recurring payments.
    - Pay bills using QR code.
- **Beneficiaries:** Add, view, and manage beneficiaries for quick and easy transfers.
- **Financial Tools:**
    - **Budget Planning:** Tools to help users manage their finances and plan their budget.
    - **Currency Converter:** A utility to check the latest exchange rates.
- **Settings:** Manage user profile and application settings.
- **Authentication:** Secure login and authentication system.

## 🚀 Technologies Used

- **Angular:** A powerful and modern web framework for building single-page applications.
- **PrimeNG:** A rich set of UI components for Angular.
- **Chart.js:** For creating interactive and visually appealing charts.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **SCSS:** A preprocessor scripting language that is interpreted or compiled into Cascading Style Sheets (CSS).
- **jsPDF & html2canvas:** For generating PDF reports.

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed. You can download them from [here](https://nodejs.org/).
- Angular CLI installed globally.
  ```sh
  npm install -g @angular/cli
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/your_project_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run the development server
   ```sh
   ng serve
   ```
4. Open your browser and navigate to `http://localhost:4200/`.

## 📁 Project Structure
```
├── .editorconfig
├── .gitignore
├── angular.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
├── public/
│   └── favicon.ico
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── app/
    │   ├── app.component.html
    │   ├── app.component.scss
    │   ├── app.component.spec.ts
    │   ├── app.component.ts
    │   ├── app.config.ts
    │   ├── app.routes.ts
    │   ├── components/
    │   │   ├── currency-converter/
    │   │   │   ├── currency-converter.component.html
    │   │   │   ├── currency-converter.component.scss
    │   │   │   └── currency-converter.component.ts
    │   │   ├── footer/
    │   │   │   ├── footer.component.html
    │   │   │   ├── footer.component.scss
    │   │   │   └── footer.component.ts
    │   │   ├── header/
    │   │   │   ├── header.component.html
    │   │   │   ├── header.component.scss
    │   │   │   └── header.component.ts
    │   │   └── sidebar/
    │   │       ├── sidebar.component.html
    │   │       ├── sidebar.component.scss
    │   │       └── sidebar.component.ts
    │   ├── guards/
    │   │   └── auth.guard.ts
    │   ├── interceptors/
    │   │   └── auth.interceptor.ts
    │   ├── interfaces/
    │   │   ├── Account.interface.ts
    │   │   ├── beneficiary.ts
    │   │   ├── CreditCard.interface.ts
    │   │   ├── DebitCard.interface.ts
    │   │   ├── ExchangeRates.interface.ts
    │   │   ├── Loan.interface.ts
    │   │   ├── ScheduledReport.interface.ts
    │   │   └── Transaction.interface.ts
    │   ├── pages/
    │   │   ├── account-operations/
    │   │   │   ├── account-operations.component.html
    │   │   │   ├── account-operations.component.scss
    │   │   │   └── account-operations.component.ts
    │   │   ├── accounts/
    │   │   │   ├── accounts.component.html
    │   │   │   ├── accounts.component.scss
    │   │   │   └── accounts.component.ts
    │   │   ├── add-new-payment/
    │   │   │   ├── add-new-payment.component.html
    │   │   │   ├── add-new-payment.component.scss
    │   │   │   ├── add-new-payment.component.spec.ts
    │   │   │   └── add-new-payment.component.ts
    │   │   ├── beneficiaries/
    │   │   │   ├── beneficiaries.component.html
    │   │   │   ├── beneficiaries.component.scss
    │   │   │   ├── beneficiaries.component.spec.ts
    │   │   │   └── beneficiaries.component.ts
    │   │   ├── budget-planning/
    │   │   │   ├── budget-planning.component.html
    │   │   │   ├── budget-planning.component.scss
    │   │   │   ├── budget-planning.component.spec.ts
    │   │   │   └── budget-planning.component.ts
    │   │   ├── credit-cards/
    │   │   │   ├── credit-cards.component.html
    │   │   │   ├── credit-cards.component.scss
    │   │   │   ├── credit-cards.component.spec.ts
    │   │   │   └── credit-cards.component.ts
    │   │   ├── dashboard/
    │   │   │   ├── dashboard.component.html
    │   │   │   ├── dashboard.component.scss
    │   │   │   └── dashboard.component.ts
    │   │   ├── debit-cards/
    │   │   │   ├── debit-cards.component.html
    │   │   │   ├── debit-cards.component.scss
    │   │   │   ├── debit-cards.component.spec.ts
    │   │   │   └── debit-cards.component.ts
    │   │   ├── loan-application/
    │   │   │   ├── loan-application.component.html
    │   │   │   ├── loan-application.component.scss
    │   │   │   ├── loan-application.component.spec.ts
    │   │   │   └── loan-application.component.ts
    │   │   ├── loan-tracking/
    │   │   │   ├── loan-tracking.component.html
    │   │   │   ├── loan-tracking.component.scss
    │   │   │   ├── loan-tracking.component.spec.ts
    │   │   │   └── loan-tracking.component.ts
    │   │   ├── login/
    │   │   │   ├── login.component.html
    │   │   │   ├── login.component.scss
    │   │   │   └── login.component.ts
    │   │   ├── marketplace/
    │   │   │   ├── marketplace.component.html
    │   │   │   ├── marketplace.component.scss
    │   │   │   ├── marketplace.component.spec.ts
    │   │   │   └── marketplace.component.ts
    │   │   ├── qr-code-payment/
    │   │   │   ├── qr-code-payment.component.html
    │   │   │   ├── qr-code-payment.component.scss
    │   │   │   ├── qr-code-payment.component.spec.ts
    │   │   │   └── qr-code-payment.component.ts
    │   │   ├── recurring-payments/
    │   │   │   ├── recurring-payments.component.html
    │   │   │   ├── recurring-payments.component.scss
    │   │   │   ├── recurring-payments.component.spec.ts
    │   │   │   └── recurring-payments.component.ts
    │   │   ├── request-credit-card/
    │   │   │   ├── request-credit-card.component.html
    │   │   │   ├── request-credit-card.component.scss
    │   │   │   ├── request-credit-card.component.spec.ts
    │   │   │   └── request-credit-card.component.ts
    │   │   ├── schedule-reports/
    │   │   │   ├── schedule-reports.component.html
    │   │   │   ├── schedule-reports.component.scss
    │   │   │   ├── schedule-reports.component.spec.ts
    │   │   │   └── schedule-reports.component.ts
    │   │   ├── settings/
    │   │   │   ├── settings.component.html
    │   │   │   ├── settings.component.scss
    │   │   │   └── settings.component.ts
    │   │   ├── transactions/
    │   │   │   ├── transactions.component.html
    │   │   │   ├── transactions.component.scss
    │   │   │   └── transactions.component.ts
    │   │   ├── transfer-funds/
    │   │   │   ├── transfer-funds.component.html
    │   │   │   ├── transfer-funds.component.scss
    │   │   │   ├── transfer-funds.component.spec.ts
    │   │   │   ├── transfer-funds.component.ts
    │   │   │   ├── domestic-transfer/
    │   │   │   │   ├── domestic-transfer.component.html
    │   │   │   │   ├── domestic-transfer.component.scss
    │   │   │   │   └── domestic-transfer.component.ts
    │   │   │   ├── international-transfer/
    │   │   │   │   ├── international-transfer.component.html
    │   │   │   │   ├── international-transfer.component.scss
    │   │   │   │   └── international-transfer.component.ts
    │   │   │   ├── intra-account-transfer/
    │   │   │   │   └── intra-account-transfer.component.html
    │   │   │   └── within-bank-transfer/
    │   │   └── view-beneficiaries/
    │   │       ├── view-beneficiaries.component.html
    │   │       ├── view-beneficiaries.component.scss
    │   │       └── view-beneficiaries.component.ts
    │   ├── pipes/
    │   │   ├── credit-card-number.pipe.ts
    │   │   ├── filter.pipe.ts
    │   │   └── uppercase-text.pipe.ts
    │   ├── services/
    │   │   ├── account-ui-state.service.ts
    │   │   ├── auth.service.ts
    │   │   ├── banking-data.service.ts
    │   │   └── currency-exchange.service.ts
    ├── assets/
    │   ├── .gitkeep
    │   ├── adcb.webp
    │   ├── BranchVisit.png
    │   ├── ClassicCard.webp
    │   ├── cubic_logo_white@2.svg
    │   ├── cubicIS.webp
    │   ├── electricity.svg
    │   ├── gas.svg
    │   ├── GoldCard.webp
    │   ├── HomeVisit.png
    │   ├── internet.svg
    │   ├── phone.svg
    │   ├── PlatinumCard.webp
    │   ├── SignatureCard.webp
    │   ├── water.svg
    │   └── primeng-styles/
    ├── environments/
    └── styles/
        ├── overlays.scss
        └── styles.scss
```

## 💡 README Improvements

To make this README even more comprehensive and helpful, consider adding the following sections:

-   **API Documentation:** Detail the backend API endpoints the application interacts with, including request/response formats and authentication methods.
-   **Deployment Guide:** Provide instructions on how to deploy the application to various environments (e.g., Netlify, Vercel, AWS S3).
-   **Testing Strategy:** Explain the testing methodology, how to run unit/integration/e2e tests, and guidelines for writing new tests.
-   **Screenshots/GIFs:** Include visual aids to showcase key features and the overall UI/UX.
-   **Live Demo:** If available, a link to a live demo of the application.
-   **Future Enhancements:** A roadmap of planned features or improvements.
