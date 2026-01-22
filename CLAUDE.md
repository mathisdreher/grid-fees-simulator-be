# CLAUDE.md - GridFees Project Guide

## Project Overview

**GridFees** is a project for analyzing and managing grid/electricity fees and related calculations.

### Repository Information
- **Repository**: mathisdreher/gridfees
- **Primary Language**: TBD (To Be Determined based on implementation)
- **Status**: New/Empty repository - awaiting initial implementation

## Repository Structure

Currently, this is a new repository. The expected structure will evolve as the project develops. Typical structure for this type of project:

```
gridfees/
├── src/                    # Source code
├── tests/                  # Test files
├── docs/                   # Documentation
├── config/                 # Configuration files
├── scripts/                # Utility scripts
├── data/                   # Data files (if applicable)
├── .github/                # GitHub workflows and templates
├── README.md              # Project documentation
├── CLAUDE.md              # This file - AI assistant guide
├── CONTRIBUTING.md        # Contribution guidelines
└── LICENSE                # Project license
```

## Development Workflow

### Branch Strategy

1. **Main Branch**: Production-ready code
2. **Feature Branches**: Use pattern `claude/claude-md-<session-id>` for AI-assisted development
3. **Naming Convention**:
   - Features: `feature/<description>`
   - Bugfixes: `bugfix/<description>`
   - Claude branches: `claude/claude-md-<session-id>`

### Git Conventions

#### Committing Changes
- Write clear, descriptive commit messages
- Use conventional commit format when possible:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

#### Push Protocol
- Always use: `git push -u origin <branch-name>`
- Branch names must start with `claude/` and match session ID for AI-assisted work
- Retry on network errors: up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

#### Pull Requests
- Fetch specific branches: `git fetch origin <branch-name>`
- Always review changes before creating PR
- Include summary of changes and test plan
- Link to related issues

### Code Review Process

1. Self-review code before committing
2. Run all tests locally
3. Check for linting errors
4. Verify no secrets or sensitive data in commits
5. Create PR with clear description
6. Address review comments

## Code Conventions

### General Principles
- **KISS**: Keep It Simple, Stupid - avoid over-engineering
- **YAGNI**: You Aren't Gonna Need It - don't add features prematurely
- **DRY**: Don't Repeat Yourself - but avoid premature abstraction
- Write self-documenting code with clear variable and function names
- Only add comments where logic isn't self-evident

### Security Best Practices
- Never commit secrets, API keys, or credentials
- Validate input at system boundaries (user input, external APIs)
- Prevent common vulnerabilities: SQL injection, XSS, command injection
- Use parameterized queries for database operations
- Sanitize user input properly

### Error Handling
- Only add error handling where failures can actually occur
- Trust internal code and framework guarantees
- Validate at system boundaries only
- Provide meaningful error messages
- Log errors appropriately for debugging

### Code Organization
- Keep functions small and focused (single responsibility)
- Use descriptive names for functions, variables, and files
- Group related functionality together
- Avoid deep nesting (max 3-4 levels)

## Testing Practices

### Test Strategy
- Write tests for critical business logic
- Test edge cases and error conditions
- Aim for reasonable coverage, not 100%
- Integration tests for user workflows
- Unit tests for complex logic

### Running Tests
```bash
# Run all tests
npm test  # or appropriate command for the language

# Run specific test file
npm test <test-file>

# Run with coverage
npm test -- --coverage
```

## Documentation Guidelines

### Code Documentation
- Use doc comments for public APIs
- Explain "why" not "what" in comments
- Keep documentation close to code
- Update docs when changing code

### README.md
Should contain:
- Project description and purpose
- Installation instructions
- Usage examples
- Configuration options
- Contributing guidelines
- License information

## Key Files and Their Purpose

### Configuration Files
- **package.json** / **requirements.txt** / **Cargo.toml**: Dependencies and scripts
- **.gitignore**: Files to exclude from version control
- **.env.example**: Environment variable template (never commit actual .env)
- **tsconfig.json** / **pyproject.toml**: Language-specific configuration

### Documentation Files
- **README.md**: Main project documentation
- **CLAUDE.md**: This file - AI assistant guide
- **CONTRIBUTING.md**: How to contribute
- **CHANGELOG.md**: Version history and changes

## AI Assistant Guidelines

### When Reading Code
1. **Always read files before modifying** - never propose changes to unread code
2. Use Read tool for specific files
3. Use Grep for searching content
4. Use Glob for finding files by pattern
5. Use Task tool with Explore agent for understanding codebase structure

### When Writing Code
1. **Avoid over-engineering** - only make requested changes
2. **No unnecessary improvements** - don't refactor surrounding code
3. **Keep it simple** - minimum complexity for current task
4. **Security first** - check for vulnerabilities before committing
5. **Test your changes** - verify functionality works

### When Making Changes
1. Read existing code first
2. Understand current patterns and follow them
3. Make minimal necessary changes
4. Don't add features not requested
5. Don't add unnecessary abstractions
6. Delete unused code completely (no backwards-compatibility hacks)

### Task Management
- Use TodoWrite tool for complex multi-step tasks
- Break down large tasks into smaller steps
- Update task status in real-time
- Mark tasks complete immediately after finishing
- Only one task in_progress at a time

### Communication
- Be concise and clear
- Output text directly (don't use echo or comments to communicate)
- Reference code with `file_path:line_number` format
- Use markdown formatting for readability
- No emojis unless explicitly requested

## Common Tasks

### Starting a New Feature
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push -u origin feature/your-feature-name
```

### Fixing a Bug
```bash
# Create bugfix branch
git checkout -b bugfix/issue-description

# Make changes, add tests
# Commit with clear message
git commit -m "fix: resolve issue with specific problem"

# Push changes
git push -u origin bugfix/issue-description
```

### Running the Project
```bash
# Install dependencies
npm install  # or appropriate command

# Run development server
npm run dev  # or appropriate command

# Run tests
npm test

# Build for production
npm run build
```

## Development Environment Setup

### Prerequisites
- Git installed and configured
- Appropriate language runtime (Node.js, Python, Rust, etc.)
- Code editor with linting support
- Terminal access

### First Time Setup
```bash
# Clone repository
git clone <repository-url>
cd gridfees

# Install dependencies
# (command depends on project type)

# Copy environment variables template
cp .env.example .env
# Edit .env with your local configuration

# Run initial setup scripts (if any)
# npm run setup

# Verify installation
# npm test
```

## Troubleshooting

### Common Issues

**Push fails with 403 error**
- Ensure branch name starts with `claude/` and includes correct session ID
- Check git remote configuration
- Verify authentication credentials

**Tests failing**
- Check for missing dependencies
- Verify environment variables are set
- Review test output for specific errors
- Ensure database/services are running if needed

**Linting errors**
- Run linter: `npm run lint` (or appropriate command)
- Auto-fix when possible: `npm run lint:fix`
- Review and fix remaining issues manually

## Project-Specific Notes

### Grid Fees Domain Knowledge
This project deals with electricity grid fees and related calculations. Key concepts:
- **Grid Fees**: Charges for using the electricity distribution network
- **Tariff Structures**: Different pricing models for electricity usage
- **Time-of-Use**: Variable rates based on time of day/season
- **Capacity Charges**: Fees based on peak demand
- **Regulatory Compliance**: Adherence to energy regulations

### Data Handling
- Handle numerical calculations with appropriate precision
- Consider time zones for time-based fees
- Validate input data ranges
- Handle edge cases (leap years, DST changes, etc.)

### Performance Considerations
- Optimize for calculation speed with large datasets
- Cache frequently accessed data
- Use efficient data structures
- Profile performance for bottlenecks

## Resources and References

### Documentation
- Project README (once created)
- API documentation (if applicable)
- External API references (if integrating with external services)

### Related Projects
- Similar grid fee calculation tools
- Energy industry standards and specifications

### Learning Resources
- Energy market documentation
- Relevant regulatory frameworks
- Technical specifications for grid systems

---

## Version History

- **2026-01-22**: Initial CLAUDE.md created for empty repository
- Future updates should be documented here

## Notes for Future Updates

This CLAUDE.md should be updated whenever:
- Project structure changes significantly
- New conventions or practices are adopted
- New tools or frameworks are added
- Development workflow changes
- Important patterns or anti-patterns are identified

Keep this document concise but comprehensive. Focus on information that helps AI assistants work effectively with this codebase.
