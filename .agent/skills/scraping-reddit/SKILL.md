---
name: scraping-reddit
description: Robust system for extracting the top posts from any subreddit. Uses Playwright and old.reddit.com for maximum resilience against anti-bot measures.
---

# Scraping Reddit

Extract the top posts (Title, Author, Score, URL) from any subreddit reliably.

## When to use this skill
- Looking for trending topics in a specific community.
- Researching recent discussions or news on Reddit.
- Extracting specific data points from subreddits for analysis.
- Bypassing standard bot detection by using `old.reddit.com` and Playwright.

## Workflow
1. [ ] Identify the target subreddit name.
2. [ ] Navigate to `https://old.reddit.com/r/[subreddit]/top/?t=day` (or `week`, `month`, etc.).
3. [ ] Use Playwright to handle rendering and bypass basic scrape blocks.
4. [ ] Extract the top entries using the standard `div.thing` CSS selector.
5. [ ] Format the output as a clear JSON list or summary.

## Instructions

### 1. Browser Logic
Always use `old.reddit.com` for maximum reliability. It is less JavaScript-heavy and less protected than the modern Reddit UI.

### 2. Helper Script
Use the provided Python script in `scripts/` for automated extraction.

### 3. Core CSS Selectors (old.reddit.com)
- **Post Container**: `div.thing`
- **Title**: `a.title`
- **Author**: `a.author`
- **Score**: `div.score.unvoted` (inner text or title attribute)
- **URL**: `a.title` (href attribute)

## Resources
- [Helper Script](scripts/reddit_scraper.py)
- [Requirements](requirements.txt)
