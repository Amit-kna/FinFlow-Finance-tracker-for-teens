import asyncio
import sys
import argparse
import json
import logging
from playwright.async_api import async_playwright, Error as PlaywrightError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RedditScraperError(Exception):
    """Base exception for all Reddit Scraper errors."""
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(message)
        self.details = details or {}

class SubredditNotFoundError(RedditScraperError):
    """Raised when a subreddit is not found."""
    pass

class ConnectionError(RedditScraperError):
    """Raised when there's a network or connection issue."""
    pass

async def scrape_subreddit(subreddit: str, limit: int = 3, time_filter: str = "day"):
    url = f"https://old.reddit.com/r/{subreddit}/top/?t={time_filter}"
    
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
            page = await context.new_page()

            logger.info(f"Navigating to r/{subreddit}...")
            try:
                await page.goto(url, wait_until="networkidle", timeout=30000)
            except PlaywrightError as e:
                if "ERR_NAME_NOT_RESOLVED" in str(e):
                    raise ConnectionError("Could not resolve reddit.com. Check your internet connection.", {"original_error": str(e)})
                raise ConnectionError(f"Failed to navigate to Reddit: {str(e)}", {"url": url})

            # Check for "Subreddit not found" page or redirect to search
            current_url = page.url
            if "/subreddits/search" in current_url or await page.query_selector("div.content[role='main'] h1:has-text('not found')"):
                raise SubredditNotFoundError(f"Subreddit r/{subreddit} does not exist.", {"subreddit": subreddit, "final_url": current_url})

            # Check for empty subreddit message
            if await page.query_selector("div#siteTable:has-text('there doesn\'t seem to be anything here')"):
                logger.warning(f"No posts found for r/{subreddit}. The subreddit might be private or empty.")
                return []

            posts = await page.query_selector_all("div.thing")
            
            results = []
            for post in posts[:limit]:
                try:
                    title_el = await post.query_selector("a.title")
                    title = await title_el.inner_text() if title_el else "N/A"
                    
                    url_el = await post.query_selector("a.title")
                    post_url = await url_el.get_attribute("href") if url_el else "N/A"
                    if post_url.startswith("/r/"):
                        post_url = f"https://old.reddit.com{post_url}"
                    
                    score_el = await post.query_selector("div.score.unvoted")
                    score = await score_el.get_attribute("title") if score_el else "0"
                    if not score or score == "0":
                        score = await score_el.inner_text() if score_el else "0"

                    author_el = await post.query_selector("a.author")
                    author = await author_el.inner_text() if author_el else "N/A"

                    results.append({
                        "title": title,
                        "author": author,
                        "score": score,
                        "url": post_url
                    })
                except Exception as e:
                    logger.error(f"Error parsing post: {e}")
                    continue

            return results

        except RedditScraperError:
            raise
        except Exception as e:
            logger.exception("An unexpected error occurred during scraping")
            raise RedditScraperError(f"Unexpected error: {str(e)}", {"type": type(e).__name__})
        finally:
            if 'browser' in locals():
                await browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reddit Scraper Skill Helper")
    parser.add_argument("subreddit", help="Name of the subreddit")
    parser.add_argument("--limit", type=int, default=3, help="Number of posts to fetch")
    parser.add_argument("--time", default="day", choices=["day", "week", "month", "year", "all"], help="Time filter for top posts")
    
    args = parser.parse_args()
    
    try:
        results = asyncio.run(scrape_subreddit(args.subreddit, args.limit, args.time))
        print(json.dumps(results, indent=2))
    except SubredditNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ConnectionError as e:
        print(f"Connection Error: {e}", file=sys.stderr)
        sys.exit(1)
    except RedditScraperError as e:
        print(f"Scraper Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected Error: {e}", file=sys.stderr)
        sys.exit(1)
