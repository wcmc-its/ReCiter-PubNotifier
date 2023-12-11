# ReCiter-PubNotifier


**ReCiter PubNotifier** is an application utilizing AWS Lambda to enhance the publication notification process within academic environments. It automates notifications to faculty regarding new academic publications, whether accepted or in-review, and integrates with [ReCiter Publication Manager]([url](https://github.com/wcmc-its/reciter-publication-manager)) and [ReCiterDB]([url](https://github.com/wcmc-its/ReCiterDB)).


## Prerequisites

* Installation of ReCiterDB - ReCiterDB serves as the backend data store for the Publication Manager, housing the schema and stored procedures. This repository includes scripts that fetch data from ReCiter and import it into a MySQL database.
* Installation of ReCiter Publication Manager - This application allows users to update how often they wish to receive notifications, and allows administrators to control what appears in the outbound emails.
* Creation of an `.env` file in the root directory with the following configurations:

```plaintext
RECITER_DB_NAME=<Your MySQL DB Name>
RECITER_DB_USERNAME=<Your MySQL DB Username>
RECITER_DB_PASSWORD=<Your MySQL DB Password>
RECITER_DB_HOST=<Your MySQL DB Host> # e.g., localhost
SMTP_HOST_NAME=<Your SMTP Host Name>
NODE_ENV=development
SMTP_USER=<Your SMTP Username>
SMTP_PASSWORD=<Your SMTP Password>
SMTP_ADMIN_EMAIL=<Your SMTP Admin Email>
```




## Technology Stack

- **Node.js**: An open-source, cross-platform server environment.
- **TypeScript**: A superset of JavaScript designed for scalable applications.
- **Sequelize**: A TypeScript and Node.js ORM for MySQL and MariaDB.
- **Nodemailer**: Simplifies sending emails from Node.js applications.
- **dotenv**: Manages environment configuration separate from the code.
- **MySQL2**: A high-performance MySQL driver.
- **Handlebars**: A template engine to build semantic templates with ease.

## Installation for Development

To set up a local development environment:

1. Clone the repository:
   ```
   git clone https://github.com/wcmc-its/ReCiter-PubNotifier.git
   ```
2. Install the application dependencies:
   ```
   # Install Node.js (use the latest LTS version)
   brew install node@20.10.0

   # Install NPM dependencies
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```

## Running the Application

To start the development server:

```shell
npm run dev # or yarn dev
```

The server will process notifications from the DB and send emails about approved or suggested publications to the designated recipients.

## Publishing to AWS Lambda

To deploy ReCiter PubNotifier to AWS Lambda:

1. Build the project:
   ```
   npm run build
   ```
2. This generates a `dist` directory with transpiled `.js` files and the required node modules (run `npm install --only=production`).
3. Create a .zip file using a CLI utility like 7zip or a GUI application.
4. Upload the .zip to an AWS S3 bucket and copy the file's S3 URL.
5. In AWS Lambda, create a new function for ReCiter PubNotifier and upload the .zip using the S3 URL.
6. If the .zip is larger than 10MB, AWS Lambda's inline code editor won't be able to extract it, but the function can still be tested.
7. Use the Test tab next to the Code tab to create a test event.
8. To schedule the function, click on the Add Trigger button and set up a cron expression.
9. Check AWS CloudWatch logs for detailed execution logs.

