# Mortgage Amortization Calculator

A modern web application for calculating and visualizing mortgage amortization schedules, specifically designed for the French mortgage system. Built with Astro, Tailwind CSS, and D3.js for interactive data visualization.

## 🚀 Features

- **Mortgage Calculator**: Calculate monthly payments, interest, and principal breakdowns
- **Interactive Charts**: Visualize amortization schedules with D3.js
- **French System Support**: Tailored for French mortgage calculations
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Multiple Amortizations**: Compare different mortgage scenarios
- **Penalty Calculations**: Handle early repayment penalties
- **Export Functionality**: Download amortization schedules

## 🛠️ Tech Stack

- **Astro** - Modern static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **D3.js** - Data visualization library
- **TypeScript** - Type safety and development experience

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mortgage-amortization
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `./dist/` directory.

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

The site is automatically built and deployed to GitHub Pages whenever you push to the `main` or `master` branch. The deployment workflow is defined in `.github/workflows/deploy.yml`.

### Setup Instructions

1. **Update Astro Configuration**
   - Open `astro.config.mjs`
   - Replace `YOUR_USERNAME` in the `site` field with your GitHub username
   - If deploying to a project page, ensure the `base` path matches your repository name
   - If deploying to a user/organization page (root domain), set `base: '/'`

2. **Enable GitHub Pages**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions" as the source
   - Save the changes

3. **Push to Main Branch**
   - Push your code to the `main` or `master` branch
   - The GitHub Actions workflow will automatically:
     - Build your Astro site
     - Deploy it to GitHub Pages
   - Your site will be available at `https://<username>.github.io/<repository-name>/`

### Manual Deployment

If you need to manually trigger a deployment, you can:
- Go to the "Actions" tab in your GitHub repository
- Select the "Deploy to GitHub Pages" workflow
- Click "Run workflow"

## 📁 Project Structure

```
mortgage-amortization/
├── src/
│   └── pages/
│       └── index.astro          # Main calculator page
├── public/
│   └── favicon.svg              # Site favicon
├── docs/
│   └── Mortgage.md              # Documentation
├── package.json                 # Dependencies and scripts
├── astro.config.mjs            # Astro configuration
├── tailwind.config.mjs         # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🧞 Available Scripts

### Development
| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### Testing & Automation
| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm test`                | Run all Playwright tests                         |
| `npm run test:ui`         | Run tests in interactive UI mode                 |
| `npm run test:headed`     | Run tests with browser visible                   |
| `npm run test:debug`      | Run tests in debug mode                          |
| `npm run test:report`     | View test results report                         |
| `npm run automate`        | Run browser automation example                   |

## 🔧 Development

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Use TypeScript for type safety
4. Follow Tailwind CSS patterns for styling

### Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.mjs`.

### Data Visualization

D3.js is used for creating interactive charts. The main chart container is in the `index.astro` file.

## 🐛 Debugging

This project includes browser debugging configurations for Cursor/VS Code:

1. **Start dev server**: `npm run dev`
2. **Press F5** in Cursor/VS Code
3. **Set breakpoints** by clicking in the gutter (left of line numbers)
4. **Debug your JavaScript** directly in the browser

See [`.vscode/DEBUG_GUIDE.md`](.vscode/DEBUG_GUIDE.md) for detailed instructions.

## 🎭 Testing & Automation

### Automated Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for automated browser testing with comprehensive E2E user journey scenarios.

#### Quick Start
```bash
# Run all tests
npm test

# Run tests interactively (recommended)
npm run test:ui

# Run comprehensive user journey tests
npm run test:user-journey

# Run user journey tests in UI mode
npm run test:user-journey:ui
```

#### Test Files
**Basic Tests** (in `tests/` directory):
- `mortgage-calculator.spec.ts` - Main calculator tests
- `amortization.spec.ts` - Amortization page tests
- `compare.spec.ts` - Compare page tests
- `example.spec.ts` - Simple examples to learn from

**User Journey Tests** (50+ realistic scenarios):
- `user-journey-basic-comparison.spec.ts` - Enter and compare offers
- `user-journey-service-costs.spec.ts` - Insurance and fees scenarios
- `user-journey-interest-rate-variations.spec.ts` - Rate impact analysis
- `user-journey-early-repayment.spec.ts` - Extra payments and penalties
- `user-journey-real-world-offers.spec.ts` - Complete bank offers
- `user-journey-edge-cases.spec.ts` - System reliability
- `user-journey-multi-language.spec.ts` - Language switching
- `user-journey-mobile-responsive.spec.ts` - Mobile workflows
- `user-journey-complete-flow.spec.ts` - End-to-end journeys
- `user-journey-error-handling.spec.ts` - Validation and errors

#### Run Specific Test Categories
```bash
# Run by priority
npm run test:journey:p0        # Critical tests (5-10 min)
npm run test:journey:p1        # Important tests (8-12 min)

# Run by category
npm run test:journey:basic     # Basic comparison
npm run test:journey:services  # Service costs
npm run test:journey:rates     # Interest rates
npm run test:journey:repayment # Early repayment
npm run test:journey:real-world # Real bank offers
npm run test:journey:mobile    # Mobile responsive
npm run test:journey:complete  # Complete flows
```

#### Learn More
- **Quick Start:** [`E2E-TESTING-QUICKSTART.md`](E2E-TESTING-QUICKSTART.md) - Get testing in 5 minutes
- **User Journey Guide:** [`tests/USER-JOURNEY-README.md`](tests/USER-JOURNEY-README.md) - Comprehensive documentation
- **Test Roadmap:** [`e2e-testing-roadmap.plan.md`](e2e-testing-roadmap.plan.md) - Detailed test scenarios

### Browser Automation

Beyond testing, Playwright can automate browser tasks:

```bash
# Run the example automation script
npm run automate
```

This demonstrates:
- ✅ Filling forms automatically
- ✅ Taking screenshots
- ✅ Generating PDFs
- ✅ Extracting data
- ✅ Testing mobile views

### Learn More

- **Quick Start**: [`QUICKSTART.md`](QUICKSTART.md) - Get up and running in 5 minutes
- **Playwright Guide**: [`PLAYWRIGHT_GUIDE.md`](PLAYWRIGHT_GUIDE.md) - Complete guide
- **Test Examples**: [`tests/README.md`](tests/README.md) - Writing tests
- **Debug Guide**: [`.vscode/DEBUG_GUIDE.md`](.vscode/DEBUG_GUIDE.md) - Browser debugging

## 📚 Documentation

For detailed information about the French mortgage system and calculations, see [docs/Mortgage.md](./docs/Mortgage.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [package.json](./package.json) file for details.

## 👀 Want to learn more?

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [D3.js Documentation](https://d3js.org/getting-started)