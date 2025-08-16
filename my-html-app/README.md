# My HTML App

This project is a simple web application that allows users to enter a URL and load it through various proxy servers. It is designed to be deployed on Vercel.

## Project Structure

```
my-html-app
├── public
│   └── index.html       # Main HTML file containing the application
├── vercel.json          # Vercel configuration file
└── README.md            # Documentation for the project
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd my-html-app
   ```

2. **Install dependencies**:
   This project does not have any external dependencies, but ensure you have a modern web browser for testing.

3. **Run the application locally**:
   Open `public/index.html` in your web browser to view the application.

## Deployment

To deploy this application on Vercel:

1. **Sign up / Log in to Vercel**: Go to [Vercel](https://vercel.com) and create an account or log in.

2. **Import the project**: Click on "New Project" and import your Git repository.

3. **Configure the deployment**: Vercel will automatically detect the project settings. Ensure that the `public` directory is set as the output directory.

4. **Deploy**: Click on the "Deploy" button. Your application will be live shortly.

## Usage

- Enter a URL in the search bar and click "GO" to load the website through various proxy servers.
- The application will attempt to connect using different proxies until it finds a working one or exhausts the list.

## License

This project is open-source and available under the MIT License.