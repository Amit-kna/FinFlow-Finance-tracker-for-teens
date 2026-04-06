import modal
import requests

app = modal.App("singularity-scraper")

image = modal.Image.debian_slim().pip_install("requests")

@app.function(image=image)
@modal.web_endpoint(method="GET")
def get_singularity_posts():
    """
    Fetches the top 6 posts from the r/singularity subreddit from the past day.
    To deploy: modal deploy modal/singularity_scraper.py
    """
    url = "https://www.reddit.com/r/singularity/top.json?limit=6&t=day"
    headers = {"User-Agent": "FinFlow-App-Scraper/1.0"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return {"error": f"Failed to fetch from Reddit: {response.status_code}"}
    
    data = response.json()
    posts = data.get("data", {}).get("children", [])
    
    results = []
    for post in posts:
        post_data = post.get("data", {})
        results.append({
            "title": post_data.get("title"),
            "url": post_data.get("url"),
            "score": post_data.get("score"),
            "num_comments": post_data.get("num_comments"),
            "author": post_data.get("author")
        })
        
    return {"posts": results}
