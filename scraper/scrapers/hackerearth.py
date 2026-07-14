import httpx
import asyncio
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class HackerEarthScraper:
    def __init__(self):
        self.url = "https://www.hackerearth.com/api/events/upcoming/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }

    async def scrape(self) -> List[dict]:
        events = []
        # Basic scaffolding
        async with httpx.AsyncClient(headers=self.headers) as client:
            try:
                # If HackerEarth exposes an open endpoint, parse it here
                pass
            except Exception as e:
                print(f"Error scraping HackerEarth: {e}")
                
        return events

if __name__ == "__main__":
    async def test():
        scraper = HackerEarthScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on HackerEarth")
    asyncio.run(test())
