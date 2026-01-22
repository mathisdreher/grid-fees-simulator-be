# CLAUDE.md - GridFees Project Guide

> **Last Updated**: 2026-01-22
> **For AI Assistants**: This document contains critical instructions for working with the GridFees codebase

## Table of Contents
- [Quick Start for AI Assistants](#quick-start-for-ai-assistants)
- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Core Philosophy](#core-philosophy)
- [AI Assistant Workflow](#ai-assistant-workflow)
- [Development Workflow](#development-workflow)
- [Code Conventions](#code-conventions)
- [Testing Practices](#testing-practices)
- [Common Scenarios](#common-scenarios)
- [Project-Specific Knowledge](#project-specific-knowledge)
- [Troubleshooting](#troubleshooting)

---

## Quick Start for AI Assistants

### Before You Start Any Task

1. **Read before writing** - ALWAYS read files before modifying them
2. **Understand the request** - Ask clarifying questions if needed
3. **Plan complex tasks** - Use TodoWrite for multi-step tasks (3+ steps)
4. **Search efficiently** - Use Task tool with Explore agent for open-ended exploration
5. **Follow existing patterns** - Read similar code to understand conventions

### Key Rules (CRITICAL)

```
✅ DO:
- Read files before editing them
- Use existing patterns and conventions
- Make minimal, focused changes
- Ask questions when requirements are unclear
- Use TodoWrite for tracking progress
- Mark one task as in_progress at a time
- Complete tasks immediately when done

❌ DON'T:
- Modify code you haven't read
- Add features that weren't requested
- Refactor code unnecessarily
- Add comments to unchanged code
- Create abstractions prematurely
- Batch task completions
```

### Decision Tree for Tool Selection

```
Need to find files by name/pattern?
  → Use Glob (e.g., "**/*.ts", "src/**/test*.py")

Need to search for code content?
  → Use Grep with specific pattern

Need to explore/understand codebase?
  → Use Task tool with subagent_type=Explore

Need to read a specific file?
  → Use Read tool

Need to modify existing file?
  → Use Edit tool (after reading first!)

Need to create new file?
  → Use Write tool (avoid unless necessary)

Need to run commands (git, npm, etc)?
  → Use Bash tool
```

---

## Project Overview

**GridFees** is a project for analyzing and managing grid/electricity fees and related calculations.

### Repository Information
- **Repository**: mathisdreher/gridfees
- **Primary Language**: TBD (will be determined during initial implementation)
- **Current Status**: Active development - repository initialized
- **Git Remote**: http://local_proxy@127.0.0.1:22460/git/mathisdreher/gridfees

### Current State
- Repository has been initialized with CLAUDE.md
- Awaiting initial implementation decisions
- No build system or dependencies defined yet

---

## Repository Structure

### Current Structure
```
gridfees/
├── .git/                   # Git repository data
└── CLAUDE.md              # This file - AI assistant guide
```

### Planned Structure

Once implementation begins, the repository will likely follow this structure:

```
gridfees/
├── src/                    # Source code
│   ├── core/              # Core business logic
│   ├── models/            # Data models and types
│   ├── utils/             # Utility functions
│   └── api/               # API endpoints (if applicable)
├── tests/                  # Test files (mirror src/ structure)
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data and fixtures
├── docs/                   # Documentation
│   ├── api/               # API documentation
│   └── guides/            # User guides
├── config/                 # Configuration files
├── scripts/                # Build and utility scripts
├── data/                   # Sample/reference data (if applicable)
├── .github/                # GitHub workflows and templates
│   └── workflows/         # CI/CD workflows
├── .gitignore             # Git ignore patterns
├── README.md              # Project documentation
├── CLAUDE.md              # This file - AI assistant guide
├── CONTRIBUTING.md        # Contribution guidelines (when needed)
└── LICENSE                # Project license (when chosen)
```

---

## Core Philosophy

### Simplicity Over Complexity

The GridFees project prioritizes simple, maintainable code over clever solutions:

- **KISS** (Keep It Simple, Stupid): Choose straightforward solutions over complex ones
- **YAGNI** (You Aren't Gonna Need It): Don't add features for hypothetical future needs
- **DRY** (Don't Repeat Yourself): But avoid premature abstraction - three similar lines is better than a premature abstraction

### Examples of Good vs Bad Approaches

**❌ BAD: Over-engineering**
```python
# Don't create unnecessary abstractions
class FeeCalculatorFactory:
    @staticmethod
    def create_calculator(fee_type):
        if fee_type == "grid":
            return GridFeeCalculator()
        # ...

calculator = FeeCalculatorFactory.create_calculator("grid")
result = calculator.calculate(amount)
```

**✅ GOOD: Simple and direct**
```python
# Just calculate the fee directly
def calculate_grid_fee(amount, rate):
    return amount * rate

result = calculate_grid_fee(100, 0.05)
```

**❌ BAD: Premature optimization**
```python
# Don't add caching for single-use functions
@lru_cache(maxsize=1000)
def format_currency(amount):
    return f"${amount:.2f}"
```

**✅ GOOD: Start simple**
```python
# Just format it
def format_currency(amount):
    return f"${amount:.2f}"

# Add caching later if profiling shows it's needed
```

---

## AI Assistant Workflow

### Phase 1: Understanding the Request

**Always start here:**

1. **Read the user request carefully**
   - What is the actual goal?
   - Are there any ambiguities?
   - What does "done" look like?

2. **Ask clarifying questions if needed**
   ```
   Example questions to ask:
   - "Should I add error handling for invalid input?"
   - "Do you want me to update existing tests or create new ones?"
   - "Should this work with both Python 3.8 and 3.9?"
   ```

3. **Use AskUserQuestion for significant decisions**
   - Choice of technology/library
   - Architecture decisions
   - Trade-offs between approaches

### Phase 2: Exploration and Research

**For tasks requiring codebase understanding:**

1. **Use the right tool for exploration**
   ```
   Question: "Where is fee calculation implemented?"
   → Use: Task tool with subagent_type=Explore

   Question: "Does the file src/fees.py exist?"
   → Use: Glob tool with pattern "src/fees.py"

   Question: "What does the calculate_fee function do?"
   → Use: Read tool on the specific file
   ```

2. **Read before modifying**
   - Always read the full file before editing
   - Understand existing patterns and conventions
   - Look at similar code for consistency

3. **Search efficiently**
   ```bash
   # Find files by pattern
   Glob: "**/*fee*.py"

   # Search content
   Grep: pattern="calculate.*fee" output_mode="files_with_matches"

   # Explore architecture
   Task: subagent_type=Explore prompt="How are fees calculated?"
   ```

### Phase 3: Planning

**For complex tasks (3+ steps):**

1. **Create a todo list with TodoWrite**
   ```
   Example todos:
   1. "Research existing fee calculation logic"
   2. "Add time-of-use fee calculation function"
   3. "Update tests for new functionality"
   4. "Run tests and verify they pass"
   ```

2. **Break down large tasks**
   - Each todo should be specific and actionable
   - Include both content and activeForm
   - Mark ONE task as in_progress at a time

3. **Update status in real-time**
   - Mark in_progress BEFORE starting work
   - Mark completed IMMEDIATELY after finishing
   - Don't batch completions

### Phase 4: Implementation

**Making changes:**

1. **Follow existing patterns**
   ```
   ✅ DO:
   - Match existing code style
   - Use same naming conventions
   - Follow same file organization
   - Maintain consistency

   ❌ DON'T:
   - Introduce new patterns without reason
   - Mix coding styles
   - Reorganize existing code structure
   ```

2. **Make minimal changes**
   ```
   ✅ DO: Fix the specific bug
   ❌ DON'T: Refactor the entire module

   ✅ DO: Add the requested feature
   ❌ DON'T: Add "helpful" extra features

   ✅ DO: Update relevant tests
   ❌ DON'T: Rewrite all tests
   ```

3. **Security checklist**
   - [ ] No SQL injection vulnerabilities (use parameterized queries)
   - [ ] No XSS vulnerabilities (sanitize user input)
   - [ ] No command injection (validate shell commands)
   - [ ] No secrets in code (use environment variables)
   - [ ] Input validation at boundaries

### Phase 5: Verification

1. **Test your changes**
   ```bash
   # Run relevant tests
   npm test  # or pytest, cargo test, etc.

   # Run specific test file
   npm test path/to/test

   # Check linting
   npm run lint
   ```

2. **Review your own code**
   - Does it solve the problem?
   - Is it the simplest solution?
   - Does it follow existing patterns?
   - Are there any security issues?

3. **Mark tasks complete**
   - Only mark complete when FULLY done
   - If errors occur, keep as in_progress
   - Create new todos for blockers

### Phase 6: Documentation

**When to document:**

```
✅ DO document:
- Public APIs and interfaces
- Complex algorithms or business logic
- Non-obvious design decisions
- Security considerations

❌ DON'T document:
- Self-evident code
- Simple getters/setters
- Obvious variable names
- Code that doesn't need it
```

### Common Anti-Patterns to Avoid

1. **Don't batch task completions**
   ```
   ❌ BAD:
   - Work on tasks 1, 2, 3
   - Mark all complete at once

   ✅ GOOD:
   - Mark task 1 in_progress
   - Complete task 1
   - Mark task 1 completed
   - Mark task 2 in_progress
   - ...
   ```

2. **Don't guess file contents**
   ```
   ❌ BAD:
   "I'll update the calculateFee function in src/fees.js"
   (without reading the file)

   ✅ GOOD:
   Read("src/fees.js")
   "I see the calculateFee function at line 45..."
   ```

3. **Don't add backwards-compatibility hacks**
   ```
   ❌ BAD:
   - Rename unused variable to _unused
   - Add // removed comments
   - Keep dead code "just in case"

   ✅ GOOD:
   - Delete unused code completely
   - Remove dead code
   - Clean removal
   ```

---

## Development Workflow

### Branch Strategy

1. **Main Branch**: Production-ready code (currently empty)
2. **Feature Branches**: For new features
   - Pattern: `feature/<description>`
   - Example: `feature/time-of-use-fees`

3. **Bugfix Branches**: For bug fixes
   - Pattern: `bugfix/<description>`
   - Example: `bugfix/calculation-rounding-error`

4. **Claude Branches**: For AI-assisted development
   - Pattern: `claude/claude-md-<session-id>`
   - Example: `claude/claude-md-mkporshl6t2q047a-Dz8qR`
   - **CRITICAL**: Must start with `claude/` and match session ID

### Current Branch
- Working on: `claude/claude-md-mkporshl6t2q047a-Dz8qR`
- Purpose: Initial repository setup and documentation

### Git Conventions

#### Commit Message Format

Use conventional commit format for all commits:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring (no functionality change)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, tooling)
- `perf:` - Performance improvements
- `style:` - Code style changes (formatting, missing semicolons)

**Examples:**
```bash
# Good commit messages
git commit -m "feat: add time-of-use fee calculation"
git commit -m "fix: correct rounding error in capacity charges"
git commit -m "docs: update README with installation instructions"
git commit -m "test: add unit tests for fee calculation edge cases"

# Bad commit messages (avoid)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdf"
git commit -m "more changes"
```

#### Commit Workflow for AI Assistants

**When creating commits:**

1. **Check status and diff in parallel**
   ```bash
   # Run these in parallel with multiple Bash tool calls
   git status
   git diff
   git log --oneline -5  # See recent commit style
   ```

2. **Analyze ALL changes**
   - Look at both staged and unstaged changes
   - Verify no secrets or sensitive data
   - Ensure all changes are intentional
   - Check for files like `.env`, `credentials.json`

3. **Draft commit message**
   - Summarize the nature of changes
   - Focus on "why" not "what"
   - Keep it concise (1-2 sentences)
   - Match the style of recent commits

4. **Stage and commit**
   ```bash
   # Stage relevant files
   git add <files>

   # Commit with heredoc for proper formatting
   git commit -m "$(cat <<'EOF'
   feat: add capacity charge calculation

   Implements peak demand-based capacity charges for grid fees.
   EOF
   )"
   ```

5. **Verify success**
   ```bash
   # Run AFTER commit completes
   git status
   git log -1  # See the commit you just made
   ```

#### Push Protocol

**CRITICAL: Branch Naming Requirements**

For AI-assisted development:
- Branch MUST start with `claude/`
- Branch MUST include matching session ID
- Push will fail with 403 error if branch name is incorrect

**Push commands:**
```bash
# First push (sets upstream)
git push -u origin claude/claude-md-<session-id>

# Subsequent pushes
git push
```

**Retry logic for network errors:**
- Retry up to 4 times
- Use exponential backoff: 2s, 4s, 8s, 16s
- Only retry on network errors (not auth errors)

**Example with retry:**
```bash
# Try 1
git push -u origin claude/claude-md-mkporshl6t2q047a-Dz8qR

# If network error, wait 2s and retry
# If network error again, wait 4s and retry
# If network error again, wait 8s and retry
# If network error again, wait 16s and final retry
```

#### Pull Requests

**Creating a PR:**

1. **Understand the full change scope**
   ```bash
   # Run in parallel
   git status
   git diff main...HEAD  # All changes from base branch
   git log main...HEAD --oneline  # All commits
   ```

2. **Review ALL commits**
   - Don't just look at the latest commit
   - Review every commit that will be in the PR
   - Ensure the full story makes sense

3. **Draft PR summary**
   ```markdown
   ## Summary
   - Brief bullet points of what changed
   - Why the changes were made
   - Any important context

   ## Test Plan
   - [ ] Ran unit tests
   - [ ] Tested manually with [scenario]
   - [ ] Verified no breaking changes
   ```

4. **Create PR with gh CLI**
   ```bash
   # Push first if needed
   git push -u origin feature/my-feature

   # Create PR with heredoc for formatting
   gh pr create --title "feat: add time-of-use fee calculation" --body "$(cat <<'EOF'
   ## Summary
   - Adds time-of-use fee calculation functionality
   - Supports peak, off-peak, and shoulder periods
   - Includes comprehensive test coverage

   ## Test Plan
   - [x] Unit tests pass
   - [x] Integration tests pass
   - [x] Manually tested with sample data
   EOF
   )"
   ```

5. **Return the PR URL**
   - Always provide the URL to the user
   - They need to see the PR

**Reviewing PRs:**
```bash
# View PR details
gh pr view <number>

# View PR diff
gh pr diff <number>

# Checkout PR locally
gh pr checkout <number>

# View comments
gh api repos/mathisdreher/gridfees/pulls/<number>/comments
```

### Code Review Process

**Pre-commit checklist:**

- [ ] All files have been read and understood
- [ ] Changes match the requested functionality
- [ ] No unnecessary refactoring or feature additions
- [ ] Code follows existing patterns and conventions
- [ ] No security vulnerabilities introduced
- [ ] No secrets or credentials in code
- [ ] Tests have been run and pass
- [ ] Linting passes (if applicable)
- [ ] Commit message is clear and follows conventions

**Self-review questions:**

1. **Correctness**: Does it solve the actual problem?
2. **Simplicity**: Is this the simplest solution?
3. **Consistency**: Does it follow existing patterns?
4. **Security**: Are there any vulnerabilities?
5. **Completeness**: Is anything missing?

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

### Test Philosophy

**Write tests that matter:**

```
✅ DO test:
- Critical business logic (fee calculations)
- Edge cases (negative values, zero, very large numbers)
- Error conditions (invalid input)
- Security boundaries (input validation)
- Complex algorithms

❌ DON'T test:
- Simple getters/setters
- Framework code
- Obvious pass-through functions
- Every single line for 100% coverage
```

### Test Organization

**Structure mirrors source code:**
```
src/
  core/
    fee_calculator.py
tests/
  unit/
    core/
      test_fee_calculator.py
  integration/
    test_fee_calculation_workflow.py
```

### Test Types

**1. Unit Tests**
- Test individual functions/classes in isolation
- Fast execution
- Mock external dependencies
- Focus on logic correctness

```python
# Example: Unit test for fee calculation
def test_calculate_grid_fee_basic():
    result = calculate_grid_fee(amount=100, rate=0.05)
    assert result == 5.0

def test_calculate_grid_fee_zero_amount():
    result = calculate_grid_fee(amount=0, rate=0.05)
    assert result == 0.0

def test_calculate_grid_fee_negative_amount_raises():
    with pytest.raises(ValueError):
        calculate_grid_fee(amount=-100, rate=0.05)
```

**2. Integration Tests**
- Test multiple components together
- Verify system workflows
- May use real dependencies (databases, files)

```python
# Example: Integration test
def test_complete_fee_calculation_workflow():
    # Load usage data
    usage = load_usage_data("test_data.csv")

    # Calculate fees
    fees = calculate_all_fees(usage)

    # Verify total
    assert fees.total > 0
    assert fees.grid_fee + fees.capacity_charge == fees.total
```

**3. Edge Case Tests**
- Boundary values
- Special cases
- Error conditions

```python
# Example: Edge cases
def test_fee_calculation_edge_cases():
    # Very large amount
    result = calculate_grid_fee(1e10, 0.05)
    assert result == 5e8

    # Very small rate
    result = calculate_grid_fee(100, 1e-10)
    assert result == 1e-8

    # Leap year edge case
    result = calculate_daily_fee(date(2024, 2, 29), rate=0.1)
    assert result > 0
```

### Running Tests

**Command patterns (adjust for your language):**

```bash
# Python
pytest                          # Run all tests
pytest tests/unit              # Run specific directory
pytest tests/unit/test_fees.py # Run specific file
pytest -v                       # Verbose output
pytest --cov=src               # With coverage

# JavaScript/TypeScript
npm test                        # Run all tests
npm test -- fees.test.js       # Run specific file
npm test -- --coverage         # With coverage
npm run test:watch             # Watch mode

# Rust
cargo test                      # Run all tests
cargo test fee_calculation     # Run specific test
cargo test -- --nocapture      # Show print statements

# Go
go test ./...                   # Run all tests
go test ./pkg/fees             # Run specific package
go test -v                      # Verbose output
go test -cover                 # With coverage
```

### Test-Driven Development (TDD)

**When to use TDD:**

```
✅ Good for TDD:
- Complex business logic
- Bug fixes (write failing test first)
- Well-defined requirements
- Calculation/algorithm implementation

⚠️ Less useful for TDD:
- Exploratory prototyping
- UI/UX development
- Unclear requirements
- Simple CRUD operations
```

**TDD Workflow:**
1. Write a failing test
2. Write minimal code to pass
3. Refactor if needed
4. Repeat

### Testing Checklist

**Before marking a task complete:**

- [ ] Relevant tests have been run
- [ ] All tests pass
- [ ] New code has test coverage
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] No tests were accidentally disabled
- [ ] Test output has been reviewed

---

## Documentation Guidelines

### Code Documentation Philosophy

```
✅ Document when:
- Public APIs (functions, classes, modules exposed to users)
- Complex business logic that isn't obvious
- Non-obvious design decisions
- Security considerations
- Performance characteristics
- Edge cases and their handling

❌ Don't document:
- Self-evident code
- Simple getters/setters
- Obvious variable names
- What the code does (code itself shows this)
```

### Good vs Bad Documentation

**❌ BAD: Stating the obvious**
```python
# Adds two numbers
def add(a, b):
    return a + b  # Return sum of a and b
```

**✅ GOOD: Explaining why/constraints**
```python
def calculate_peak_demand_charge(kw_peak, tariff):
    """Calculate demand charge based on peak usage.

    Uses the highest 15-minute interval reading in the billing period.
    Per utility tariff rules, minimum billable demand is 5 kW.

    Args:
        kw_peak: Peak demand in kW (0-10000)
        tariff: Tariff with demand_rate in $/kW

    Returns:
        Demand charge in dollars

    Raises:
        ValueError: If kw_peak is negative or exceeds 10000 kW
    """
    if kw_peak < 0 or kw_peak > 10000:
        raise ValueError(f"Invalid peak demand: {kw_peak}")

    # Apply minimum billable demand per tariff rules
    billable_kw = max(kw_peak, 5.0)
    return billable_kw * tariff.demand_rate
```

**❌ BAD: Outdated comments**
```python
def get_rate(timestamp):
    # TODO: Add support for TOU rates
    # FIXME: This doesn't work on weekends
    # NOTE: Will be refactored later
    return 0.10  # Hardcoded for now
```

**✅ GOOD: Accurate, current comments**
```python
def get_rate(timestamp, tariff):
    """Get applicable rate for timestamp.

    Supports flat and time-of-use tariffs. Weekend rates
    apply from Saturday 00:00 to Sunday 23:59.
    """
    if tariff.type == 'flat':
        return tariff.rate
    return _get_tou_rate(timestamp, tariff)
```

### README.md Structure

**Essential sections:**
```markdown
# Project Name

Brief description (1-2 sentences)

## Installation

Step-by-step install instructions

## Quick Start

Minimal example to get running

## Usage

Common usage examples

## Configuration

Environment variables and config options

## Development

How to set up development environment

## Testing

How to run tests

## License

License information
```

### When to Update Documentation

**Always update docs when:**
- [ ] Public API changes (function signatures, parameters)
- [ ] Behavior changes
- [ ] New features added
- [ ] Configuration options added/changed
- [ ] Dependencies change

**Document close to code:**
```
✅ DO:
- Docstrings in the same file as code
- Comments near relevant code
- README in project root

❌ DON'T:
- Separate docs that get out of sync
- Huge comment blocks far from code
- Documentation that duplicates code
```

---

## Key Files Reference

### Configuration Files (Common)

| File | Purpose | When to Update |
|------|---------|----------------|
| `package.json` | Node.js dependencies and scripts | Add/remove npm packages |
| `requirements.txt` | Python dependencies (pip) | Add/remove packages |
| `pyproject.toml` | Python project config (modern) | Project setup, dependencies |
| `Cargo.toml` | Rust dependencies and project config | Add/remove crates |
| `.gitignore` | Files to exclude from git | New build artifacts, etc. |
| `.env.example` | Environment variable template | New env vars needed |
| `tsconfig.json` | TypeScript compiler options | TypeScript config |
| `.eslintrc` / `pylintrc` | Linting configuration | Change lint rules |

### Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Main project documentation | Users and developers |
| `CLAUDE.md` | AI assistant guide (this file) | AI assistants |
| `CONTRIBUTING.md` | Contribution guidelines | Contributors |
| `CHANGELOG.md` | Version history | Users tracking changes |
| `LICENSE` | Legal terms | Everyone |
| `docs/` | Detailed documentation | Users needing depth |

### Current Repository Files

| File | Status | Description |
|------|--------|-------------|
| `.git/` | ✅ Exists | Git repository data |
| `CLAUDE.md` | ✅ Exists | This file - AI assistant guide |
| `README.md` | ⏳ Planned | To be created with project |
| `LICENSE` | ⏳ Planned | To be added when chosen |
| `.gitignore` | ⏳ Planned | To be created with project setup |

---

## Common Scenarios

### Scenario 1: User Asks to Add a New Feature

**Request**: "Add support for time-of-use pricing with peak and off-peak rates"

**Workflow:**

1. **Understand and clarify**
   ```
   Ask if needed:
   - What time periods define peak vs off-peak?
   - Should this support multiple time zones?
   - Any specific data format requirements?
   ```

2. **Create todo list (if complex)**
   ```
   TodoWrite:
   1. Research existing pricing structure in codebase
   2. Design time-of-use pricing function
   3. Implement peak/off-peak rate calculations
   4. Add tests for new functionality
   5. Update documentation
   ```

3. **Explore existing code**
   ```
   # If architecture is unclear, use Explore agent
   Task(subagent_type=Explore, prompt="How are pricing rates currently structured?")

   # If you know the files
   Read("src/pricing.py")
   Grep(pattern="rate.*calculation", output_mode="content")
   ```

4. **Implement**
   ```
   # Follow existing patterns
   # Make minimal changes
   # Focus on requested functionality only
   ```

5. **Test and verify**
   ```bash
   # Run tests
   pytest tests/test_pricing.py

   # Verify it works
   ```

6. **Commit and push**
   ```bash
   git add src/pricing.py tests/test_pricing.py
   git commit -m "feat: add time-of-use pricing with peak/off-peak rates"
   git push -u origin feature/time-of-use-pricing
   ```

### Scenario 2: User Asks to Fix a Bug

**Request**: "The capacity charge calculation is rounding incorrectly"

**Workflow:**

1. **Locate the issue**
   ```
   # Search for capacity charge code
   Grep(pattern="capacity.*charge", output_mode="files_with_matches")

   # Read the relevant file
   Read("src/charges.py")
   ```

2. **Understand the problem**
   ```
   # Look for the calculation at line X
   # Check how rounding is done
   # Identify the issue
   ```

3. **Write a failing test first (TDD)**
   ```python
   # Add test that demonstrates the bug
   def test_capacity_charge_rounding():
       # This should fail initially
       result = calculate_capacity_charge(12.345)
       assert result == 12.35  # Not 12.34
   ```

4. **Fix the bug**
   ```
   Edit the file to fix the rounding logic
   ```

5. **Verify fix**
   ```bash
   # Run the test
   pytest tests/test_charges.py::test_capacity_charge_rounding

   # Run all tests to ensure no regression
   pytest
   ```

6. **Commit**
   ```bash
   git add src/charges.py tests/test_charges.py
   git commit -m "fix: correct rounding in capacity charge calculation"
   git push -u origin bugfix/capacity-charge-rounding
   ```

### Scenario 3: User Asks "How Does X Work?"

**Request**: "How are grid fees calculated?"

**Workflow:**

1. **Explore the codebase**
   ```
   # Use Explore agent for architectural questions
   Task(
     subagent_type=Explore,
     prompt="Explain how grid fees are calculated in this codebase"
   )
   ```

2. **Read relevant files**
   ```
   # Based on exploration, read key files
   Read("src/grid_fees.py")
   Read("src/models/fee.py")
   ```

3. **Provide clear explanation**
   ```
   "Grid fees are calculated in src/grid_fees.py:45 using the
   calculate_grid_fee() function. It takes the usage amount and
   multiplies by the rate from the tariff structure.

   The calculation flow is:
   1. Load tariff rate from config (line 23)
   2. Validate usage amount (line 34)
   3. Apply rate calculation (line 45)
   4. Add any applicable surcharges (line 67)

   See src/grid_fees.py:45 for the main implementation."
   ```

### Scenario 4: User Asks to Refactor Code

**Request**: "Refactor the fee calculation module"

**⚠️ Critical: Be careful with refactoring requests**

1. **Clarify scope**
   ```
   AskUserQuestion:
   - What specifically needs refactoring?
   - What problem are you trying to solve?
   - Is there a bug or performance issue?
   - Or is this for code organization?
   ```

2. **If legitimate refactoring needed:**
   ```
   ✅ DO refactor if:
   - Code is genuinely hard to understand
   - There's duplication causing bugs
   - Performance is measurably poor
   - Preparing for a new feature

   ❌ DON'T refactor if:
   - Code is "not perfect" but works
   - Personal style preference
   - Premature optimization
   - "Just because"
   ```

3. **If proceeding:**
   ```
   - Read all relevant code first
   - Ensure tests exist and pass
   - Make incremental changes
   - Run tests after each change
   - Keep commits small and focused
   ```

### Scenario 5: Creating Initial Project Structure

**Request**: "Set up a Python project for grid fee calculations"

**Workflow:**

1. **Ask about requirements**
   ```
   AskUserQuestion:
   - What Python version? (3.8+, 3.9+, etc.)
   - Any specific libraries? (pandas, numpy, etc.)
   - Need web API? (FastAPI, Flask, etc.)
   - Database needed? (PostgreSQL, SQLite, etc.)
   ```

2. **Create structure**
   ```
   Write .gitignore
   Write README.md
   Write requirements.txt or pyproject.toml
   Write src/__init__.py
   Write tests/__init__.py
   ```

3. **Add configuration**
   ```
   Write .env.example
   Write config.py (if needed)
   ```

4. **Commit initial structure**
   ```bash
   git add .
   git commit -m "chore: initialize Python project structure"
   git push -u origin main
   ```

### Scenario 6: User Provides Vague Requirements

**Request**: "Make it better"

**Workflow:**

1. **DON'T guess - ASK!**
   ```
   ❌ BAD: "I'll refactor everything and add features"

   ✅ GOOD: Ask clarifying questions:
   - "What specific aspect would you like improved?"
   - "Are there performance issues?"
   - "Is the code hard to understand?"
   - "Are there bugs that need fixing?"
   ```

2. **Get specific requirements**
   ```
   Use AskUserQuestion with options:
   - Improve performance
   - Fix bugs
   - Better error handling
   - Better documentation
   - Other (custom input)
   ```

3. **Only proceed with clarity**
   - Don't make assumptions
   - Don't add unrequested features
   - Don't refactor unnecessarily

### Scenario 7: Tests Are Failing

**Situation**: Tests fail after making changes

**Workflow:**

1. **DON'T mark task as completed**
   ```
   ❌ BAD:
   - Implement feature
   - Tests fail
   - Mark task completed anyway

   ✅ GOOD:
   - Keep task as in_progress
   - Fix the issues
   - Only mark completed when tests pass
   ```

2. **Investigate failures**
   ```bash
   # Run tests with verbose output
   pytest -v

   # Run specific failing test
   pytest tests/test_fees.py::test_specific_case -v

   # Check test output carefully
   ```

3. **Fix the issue**
   ```
   Options:
   - Fix the code to match test expectations
   - Update test if requirements changed
   - Add missing functionality
   ```

4. **Verify all tests pass**
   ```bash
   # Run full test suite
   pytest

   # Only then mark task completed
   ```

### Scenario 8: Need to Update Documentation

**Request**: "Update the README"

**Workflow:**

1. **Read existing README first**
   ```
   Read("README.md")
   ```

2. **Make targeted updates**
   ```
   ✅ DO:
   - Update specific sections
   - Add new information
   - Fix outdated content

   ❌ DON'T:
   - Rewrite entire document
   - Add emojis (unless requested)
   - Change style significantly
   - Add unnecessary sections
   ```

3. **Keep it accurate**
   ```
   - Verify commands actually work
   - Test installation instructions
   - Check links aren't broken
   - Ensure examples are correct
   ```

### Quick Reference: Common Commands

**Git Operations:**
```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Stage files
git add <files>

# Commit with heredoc
git commit -m "$(cat <<'EOF'
type: description
EOF
)"

# Push
git push -u origin <branch-name>

# Create PR
gh pr create --title "title" --body "body"
```

**File Operations:**
```
# Don't use bash for these - use proper tools:
Read("file.py")           # Not: cat file.py
Edit("file.py", ...)      # Not: sed/awk
Write("file.py", ...)     # Not: echo > file.py
Glob("**/*.py")           # Not: find or ls
Grep(pattern="foo")       # Not: grep or rg
```

**Testing:**
```bash
# Python
pytest
pytest path/to/test.py
pytest -v
pytest --cov=src

# JavaScript
npm test
npm test -- file.test.js
npm run test:watch

# Rust
cargo test
cargo test test_name

# Go
go test ./...
go test ./pkg/name
```

---

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

### Git Issues

#### Push Fails with 403 Error

**Problem**: `git push` returns 403 Forbidden

**Causes and Solutions:**

```
❌ Wrong branch name format
  → Branch must start with 'claude/' and include session ID
  → Current session: claude/claude-md-mkporshl6t2q047a-Dz8qR

❌ Authentication issue
  → Check git remote URL
  → Verify credentials configured

❌ Permissions issue
  → Verify you have write access to repository
  → Check if branch protection rules apply
```

**Fix:**
```bash
# Check current branch
git branch --show-current

# If wrong branch name, create correct one
git checkout -b claude/claude-md-<correct-session-id>

# Check remote
git remote -v

# Push with correct branch
git push -u origin claude/claude-md-<correct-session-id>
```

#### Merge Conflicts

**Problem**: Git shows merge conflicts

**Resolution:**
```bash
# 1. Check conflict files
git status

# 2. Read the conflicted files
# Use Read tool to view conflicts

# 3. Resolve conflicts manually
# Use Edit tool to fix conflicts

# 4. Mark as resolved
git add <resolved-files>

# 5. Complete merge
git commit
```

#### Uncommitted Changes

**Problem**: Need to switch branches with uncommitted changes

**Solution:**
```bash
# Option 1: Commit changes
git add .
git commit -m "WIP: save current work"

# Option 2: Stash changes
git stash
git checkout other-branch
# Later:
git checkout original-branch
git stash pop
```

### Test Failures

#### Tests Fail After Changes

**Workflow:**

1. **Read the error message carefully**
   ```bash
   # Run with verbose output
   pytest -v
   npm test -- --verbose
   ```

2. **Identify the issue**
   ```
   Common causes:
   - Code logic error
   - Missing edge case handling
   - Incorrect test assumptions
   - Missing dependencies
   - Environment variables not set
   ```

3. **Fix systematically**
   ```
   ✅ DO:
   - Fix the root cause
   - Run specific test: pytest tests/test_file.py::test_name
   - Verify fix works
   - Run full suite to check for regressions

   ❌ DON'T:
   - Disable or skip failing tests
   - Mark task complete with failing tests
   - Guess at fixes without understanding
   ```

#### Import Errors

**Problem**: `ModuleNotFoundError` or `ImportError`

**Solutions:**
```bash
# Python
# - Check virtual environment activated
# - Install dependencies
pip install -r requirements.txt

# JavaScript
# - Install dependencies
npm install

# Check Python path
python -c "import sys; print(sys.path)"

# Check if module exists
ls src/module_name.py
```

#### Environment Variables Missing

**Problem**: Tests fail due to missing env vars

**Solution:**
```bash
# Check if .env exists
ls .env

# If not, copy example
cp .env.example .env

# Edit with appropriate values
# Use Read/Edit tools

# Verify loaded
python -c "import os; print(os.getenv('VARIABLE_NAME'))"
```

### Linting and Formatting Issues

#### Linting Errors

**Problem**: Linter reports style issues

**Solutions:**
```bash
# Python (flake8, pylint, black)
flake8 src/
pylint src/
black src/ --check

# Auto-fix with black
black src/

# JavaScript (ESLint, Prettier)
npm run lint
npm run lint:fix
npm run format

# Rust
cargo clippy
cargo fmt --check
cargo fmt  # Auto-fix
```

**When to fix vs. ignore:**
```
✅ Fix these:
- Clear style violations
- Unused variables
- Missing type hints (if project uses them)
- Inconsistent formatting

⚠️ Sometimes ignore:
- Overly strict rules (use # noqa or eslint-disable)
- False positives
- Legacy code (if not touching it)
```

### Development Environment Issues

#### Dependencies Won't Install

**Problem**: `pip install` or `npm install` fails

**Debug steps:**
```bash
# Python
# 1. Check Python version
python --version

# 2. Try upgrade pip
pip install --upgrade pip

# 3. Try install with verbose
pip install -v -r requirements.txt

# 4. Check for conflicts
pip check

# JavaScript
# 1. Check Node version
node --version

# 2. Clear cache
npm cache clean --force

# 3. Delete node_modules and reinstall
rm -rf node_modules
npm install

# 4. Try with --legacy-peer-deps
npm install --legacy-peer-deps
```

#### Build Failures

**Problem**: Build command fails

**Debug approach:**
```bash
# 1. Read error message completely
# 2. Check for missing dependencies
# 3. Verify environment setup
# 4. Try clean build

# Python
rm -rf dist/ build/ *.egg-info
python setup.py clean --all

# JavaScript
rm -rf dist/ build/
npm run clean  # if available
npm run build

# Rust
cargo clean
cargo build
```

### AI Assistant Specific Issues

#### "I Can't Find the File"

**Problem**: AI can't locate a file

**Solutions:**
```
1. Verify file actually exists
   Glob("**/*filename*")

2. Check exact path
   ls -la src/

3. Search for content instead
   Grep(pattern="function_name")

4. Explore architecture
   Task(subagent_type=Explore, prompt="Find files related to X")
```

#### "I Don't Understand the Codebase"

**Problem**: Architecture is unclear

**Solution:**
```
✅ DO:
Use Task tool with Explore agent
Task(
  subagent_type=Explore,
  prompt="Explain the architecture and key components",
  thoroughness="very thorough"
)

❌ DON'T:
- Make assumptions
- Modify code without understanding
- Add features blindly
```

#### "The Test Output Is Too Long"

**Problem**: Test output exceeds limits

**Solution:**
```bash
# Run specific test instead of all
pytest tests/specific_test.py

# Reduce verbosity
pytest -q  # Quiet mode

# Run only failed tests
pytest --lf  # Last failed

# Limit output with head
pytest | head -100
```

#### "I Need to Check on Background Task"

**Problem**: Need to see background agent progress

**Solution:**
```
# If agent was run with run_in_background=true
# You received an output_file path

# Read the output file
Read("path/to/output_file")

# Or use tail to see recent output
Bash: tail -50 path/to/output_file

# Or use TaskOutput tool
TaskOutput(task_id="<task-id>", block=false)
```

### Performance Issues

#### "The Operation Is Too Slow"

**Workflow:**

1. **Measure first**
   ```python
   import time

   start = time.time()
   result = expensive_operation()
   print(f"Took {time.time() - start:.2f} seconds")
   ```

2. **Profile if needed**
   ```bash
   # Python
   python -m cProfile -s cumtime script.py

   # Or use line profiler
   kernprof -l -v script.py
   ```

3. **Identify bottleneck**
   - Is it I/O bound? (file/network operations)
   - Is it CPU bound? (calculations)
   - Is it memory bound? (large datasets)

4. **Optimize appropriately**
   - I/O bound: Use async, caching, batching
   - CPU bound: Use vectorization, better algorithms
   - Memory bound: Process in chunks, use generators

---

### Getting Help

**When you're stuck:**

1. **Ask the user for clarification**
   - Use AskUserQuestion for decisions
   - Explain what you've tried
   - Be specific about what's unclear

2. **Search for information**
   ```
   # Search codebase
   Grep, Glob, Task(Explore)

   # Search web if needed
   WebSearch("specific technical question")
   ```

3. **Read documentation**
   ```
   # Look for docs in repo
   Read("docs/README.md")

   # Check for online docs
   WebFetch(url="...", prompt="What does X do?")
   ```

4. **Try small experiments**
   ```
   # Create minimal test case
   # Verify assumptions
   # Debug step by step
   ```

**Remember**: It's better to ask than to guess wrong!

---

## Project-Specific Knowledge

### Grid Fees Domain

This project deals with electricity grid fees and related calculations. Understanding these concepts is important for implementing correct logic.

#### Core Concepts

**1. Grid Fees (Network Charges)**
- Charges for using the electricity distribution network
- Separate from energy costs (the electricity itself)
- Covers infrastructure maintenance and operations
- Usually charged by distribution system operators (DSOs)
- Can be fixed, variable, or a combination

**2. Tariff Structures**
Different pricing models for electricity usage:

```
Common tariff types:
- Flat Rate: Same rate 24/7
- Time-of-Use (TOU): Different rates by time period
- Real-Time Pricing: Rates change hourly/daily based on market
- Tiered Pricing: Rate changes based on usage volume
- Demand Charges: Based on peak usage (kW)
```

**3. Time-of-Use (TOU) Pricing**
Variable rates based on time:

```
Typical periods:
- Peak: Highest demand times (e.g., 4pm-9pm weekdays)
- Off-Peak: Lowest demand (e.g., 10pm-6am)
- Shoulder/Mid-Peak: Between peak and off-peak
- Seasonal variations (summer vs winter peaks)
```

**4. Capacity/Demand Charges**
- Based on highest power draw (kW) in a period
- Measured over 15-minute or 30-minute intervals
- Incentivizes load spreading
- Can be very significant for commercial users

**5. Energy Charges**
- Based on consumption volume (kWh)
- Different from capacity (kW) charges
- May include variable rates by time or tier

#### Important Considerations

**Numerical Precision**
```python
# ✅ Use Decimal for money calculations
from decimal import Decimal

fee = Decimal("0.05") * Decimal("100.00")
# Result: Decimal('5.00')

# ❌ Don't use float for money
fee = 0.05 * 100.00  # Can have rounding errors
```

**Time Zones**
```python
# Always use timezone-aware datetimes for TOU
from datetime import datetime
from zoneinfo import ZoneInfo

# ✅ Timezone-aware
dt = datetime(2024, 6, 15, 18, 0, tzinfo=ZoneInfo("America/New_York"))

# ❌ Naive datetime (ambiguous)
dt = datetime(2024, 6, 15, 18, 0)
```

**Edge Cases to Handle**
```
- Zero usage (still may have fixed charges)
- Negative values (should error or represent credits?)
- Very large values (commercial/industrial users)
- Leap years and leap seconds
- DST transitions (spring forward, fall back)
- Month boundaries for billing periods
- Partial periods (user joined mid-month)
```

**Data Validation**
```python
def validate_usage(kwh):
    """Validate electricity usage data."""
    if kwh < 0:
        raise ValueError("Usage cannot be negative")
    if kwh > 100000:  # Sanity check
        raise ValueError("Usage exceeds reasonable maximum")
    return kwh

def validate_rate(rate):
    """Validate tariff rate."""
    if rate < 0:
        raise ValueError("Rate cannot be negative")
    if rate > 1.0:  # Example limit
        raise ValueError("Rate exceeds reasonable maximum")
    return rate
```

### Performance Considerations

**When to Optimize**
```
✅ Profile first, then optimize:
- Large dataset processing (millions of records)
- Real-time calculations
- Proven bottlenecks

❌ Don't prematurely optimize:
- "This might be slow" (measure first!)
- Small datasets
- One-time calculations
```

**Optimization Strategies**
```python
# 1. Use vectorization for large datasets (pandas/numpy)
import pandas as pd
df['fee'] = df['usage'] * df['rate']  # Vectorized

# vs
for i in range(len(df)):  # Slow
    df.loc[i, 'fee'] = df.loc[i, 'usage'] * df.loc[i, 'rate']

# 2. Cache expensive calculations
from functools import lru_cache

@lru_cache(maxsize=128)
def get_tariff_for_period(timestamp, tariff_id):
    # Expensive database/API call
    return fetch_tariff(timestamp, tariff_id)

# 3. Use appropriate data structures
# Dict for lookups: O(1)
tariffs = {'peak': 0.15, 'offpeak': 0.08}
rate = tariffs['peak']

# Not list search: O(n)
tariffs = [('peak', 0.15), ('offpeak', 0.08)]
rate = next(r for name, r in tariffs if name == 'peak')
```

### Common Patterns

**Fee Calculation Pattern**
```python
def calculate_total_fees(usage_kwh, peak_kw, tariff):
    """Calculate total electricity fees.

    Args:
        usage_kwh: Energy consumption in kWh
        peak_kw: Peak demand in kW
        tariff: Tariff structure with rates

    Returns:
        Total fees broken down by component
    """
    # Validate inputs
    usage_kwh = validate_usage(usage_kwh)
    peak_kw = validate_demand(peak_kw)

    # Calculate components
    energy_charge = usage_kwh * tariff.energy_rate
    demand_charge = peak_kw * tariff.demand_rate
    grid_fee = calculate_grid_fee(usage_kwh, tariff)

    # Return detailed breakdown
    return {
        'energy_charge': energy_charge,
        'demand_charge': demand_charge,
        'grid_fee': grid_fee,
        'total': energy_charge + demand_charge + grid_fee
    }
```

**Time-of-Use Rate Lookup Pattern**
```python
def get_rate_for_time(timestamp, tariff):
    """Get the applicable rate for a given time.

    Args:
        timestamp: Timezone-aware datetime
        tariff: TOU tariff structure

    Returns:
        Applicable rate for the time period
    """
    hour = timestamp.hour
    weekday = timestamp.weekday()  # 0=Monday, 6=Sunday

    # Weekend rates
    if weekday >= 5:  # Saturday or Sunday
        return tariff.weekend_rate

    # Weekday TOU rates
    if 16 <= hour < 21:  # 4 PM to 9 PM
        return tariff.peak_rate
    elif 22 <= hour or hour < 6:  # 10 PM to 6 AM
        return tariff.offpeak_rate
    else:
        return tariff.shoulder_rate
```

---

## Resources and References

### Internal Documentation

| Resource | Location | Purpose |
|----------|----------|---------|
| This guide | `/CLAUDE.md` | AI assistant reference |
| Project README | `/README.md` | (To be created) General documentation |
| API docs | `/docs/api/` | (When needed) API reference |
| Architecture docs | `/docs/guides/` | (When needed) System design |

### External Resources

**Grid Fees & Energy Domain:**
- Energy tariff structures and regulations (region-specific)
- Distribution System Operator (DSO) documentation
- Time-of-use (TOU) pricing standards
- Demand charge calculation methods
- Electricity market fundamentals

**Technical Documentation:**
- Language-specific docs (Python, JavaScript, Rust, etc.)
- Framework documentation (when chosen)
- Library references (as dependencies are added)

**Industry Standards:**
- Energy data formats (e.g., Green Button)
- Billing standards
- Regulatory compliance requirements

### Related Concepts

**For implementing fee calculations:**
- Decimal/precise arithmetic (for money)
- Time zone handling (for TOU rates)
- Date/time calculations (for billing periods)
- Data validation and sanitization
- Numerical stability and rounding

**For production systems:**
- API design (if building an API)
- Database schema design (if needed)
- Error handling and logging
- Testing strategies
- Performance optimization

---

## Quick Reference Cheat Sheet

### Before Starting Any Task

```
1. ☐ Read the user's request completely
2. ☐ Ask clarifying questions if needed
3. ☐ Create TodoWrite for complex tasks (3+ steps)
4. ☐ Explore codebase if architecture unclear
5. ☐ Read files before modifying them
```

### Tool Selection Guide

```
Find files by name:        Glob("**/*.py")
Search file contents:      Grep(pattern="...", output_mode="content")
Explore codebase:          Task(subagent_type=Explore, ...)
Read specific file:        Read("path/to/file")
Edit existing file:        Edit(file_path, old_string, new_string)
Create new file:           Write(file_path, content)
Run commands:              Bash(command="...")
Ask user questions:        AskUserQuestion(questions=[...])
```

### Key Principles

```
✅ DO:
- Read before writing
- Follow existing patterns
- Make minimal changes
- Ask when unclear
- Test changes
- Update one todo at a time

❌ DON'T:
- Guess file contents
- Add unrequested features
- Refactor unnecessarily
- Batch todo completions
- Skip tests
- Commit secrets
```

### Git Workflow

```bash
# Status and diff
git status
git diff

# Commit (use heredoc)
git add <files>
git commit -m "$(cat <<'EOF'
type: description
EOF
)"

# Push (branch must start with claude/)
git push -u origin claude/claude-md-<session-id>

# Create PR
gh pr create --title "..." --body "..."
```

### Testing Workflow

```bash
# Run tests
pytest                    # Python
npm test                  # JavaScript
cargo test                # Rust
go test ./...             # Go

# Run specific test
pytest path/to/test.py::test_name

# With coverage
pytest --cov=src
npm test -- --coverage
```

### Security Checklist

```
☐ No SQL injection (use parameterized queries)
☐ No XSS (sanitize user input)
☐ No command injection (validate shell args)
☐ No secrets in code (use env vars)
☐ Input validation at boundaries
☐ Error messages don't leak info
```

### Common Patterns

```python
# Validate input
def validate_input(value):
    if value < 0:
        raise ValueError("Must be non-negative")
    return value

# Use Decimal for money
from decimal import Decimal
amount = Decimal("10.50")

# Use timezone-aware datetimes
from datetime import datetime
from zoneinfo import ZoneInfo
dt = datetime(2024, 1, 1, 12, 0, tzinfo=ZoneInfo("America/New_York"))

# Docstring format
def function(arg):
    """Brief description.

    Args:
        arg: Description

    Returns:
        Description

    Raises:
        ValueError: When...
    """
```

---

## Development Environment Setup

### Prerequisites

**Verify installations:**
```bash
git --version          # Git 2.x+
python --version       # Python 3.8+ (if Python project)
node --version         # Node.js 16+ (if Node project)
cargo --version        # Rust (if Rust project)
```

### First Time Setup (Example for Python)

```bash
# 1. Clone repository
git clone <repository-url>
cd gridfees

# 2. Create virtual environment (Python)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env
# Edit .env with your values

# 5. Run tests to verify
pytest

# 6. Try running the project
python -m gridfees  # or appropriate command
```

### Environment Variables

**Common variables (when project is implemented):**
```bash
# .env.example template
DATABASE_URL=postgresql://localhost/gridfees
API_KEY=your_api_key_here
DEBUG=false
LOG_LEVEL=info
```

**Never commit:**
- `.env` (actual values)
- `credentials.json`
- API keys
- Passwords
- Private keys

**Always commit:**
- `.env.example` (template with no real values)

---

## Version History

### 2026-01-22
- **v2.0** - Major update with comprehensive improvements
  - Added detailed AI workflow with phases (Understanding → Verification)
  - Added decision trees and tool selection guidance
  - Added 8 comprehensive scenario examples
  - Expanded git workflow with actual command examples
  - Added extensive testing practices section
  - Added project-specific domain knowledge (grid fees)
  - Added troubleshooting for common issues
  - Added quick reference cheat sheet
  - Added good vs. bad code examples throughout
  - Better organization with table of contents
  - Added current repository state information

- **v1.0** - Initial CLAUDE.md created
  - Basic structure and conventions
  - Core development workflow
  - Initial AI assistant guidelines

### Future Updates

Document here when:
- Project structure changes significantly
- Language/framework is chosen and implemented
- New conventions or practices are adopted
- Development workflow changes
- Important patterns or anti-patterns are identified
- New tools or dependencies are added

---

## Notes for Maintainers

### Keeping CLAUDE.md Current

**Update this file when:**

1. **Architecture changes**
   - New directories added
   - File structure reorganized
   - Key files added or moved

2. **Workflow changes**
   - New development processes
   - Different branching strategy
   - CI/CD pipeline changes

3. **New patterns emerge**
   - Common patterns used throughout code
   - Anti-patterns to avoid
   - Lessons learned from issues

4. **Dependencies change**
   - New major libraries added
   - Framework version upgrades
   - Tool chain changes

5. **Team decisions**
   - Coding style decisions
   - Architecture decisions
   - Technology choices

### What to Keep vs. Remove

**Keep:**
- Core principles (KISS, YAGNI, DRY)
- Security best practices
- Git workflow (still relevant)
- AI assistant workflow patterns
- Project-specific domain knowledge

**Update:**
- Tool/command examples (as tech stack chosen)
- File structure (as project grows)
- Specific patterns (as code evolves)
- Troubleshooting (as issues discovered)

**Remove:**
- Outdated commands
- Deprecated patterns
- No-longer-relevant sections
- Information moved elsewhere

---

## Summary

This CLAUDE.md serves as the definitive guide for AI assistants working on the GridFees project. Key takeaways:

### Core Values
1. **Simplicity** - Choose simple over clever
2. **Clarity** - Ask rather than guess
3. **Focus** - Make only requested changes
4. **Quality** - Test and verify everything
5. **Security** - Never compromise on security

### Workflow Essentials
1. Understand the request (ask questions!)
2. Explore before implementing (read first!)
3. Plan complex tasks (use TodoWrite)
4. Implement minimally (no over-engineering)
5. Verify thoroughly (run tests)
6. Document appropriately (when helpful)

### Critical Rules
- **ALWAYS** read files before modifying
- **NEVER** add unrequested features
- **ALWAYS** use proper tools (not bash for file ops)
- **NEVER** commit secrets
- **ALWAYS** test changes
- **NEVER** batch todo completions

### Remember
This document exists to help you work effectively with the codebase. When in doubt, refer back to the relevant section. If something is unclear or missing, ask the user for clarification.

Good luck, and happy coding!

---

**Document maintained by**: GridFees Development Team
**Last comprehensive update**: 2026-01-22
**Next review**: When project structure is established
**Questions or suggestions**: Ask the repository owner or contributors
