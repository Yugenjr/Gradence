import httpx
import asyncio
from typing import List
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class DevfolioScraper:
    def __init__(self):
        self.url = "https://api.devfolio.co/api/search/hackathons"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    async def scrape(self) -> List[dict]:
        events = []
        payload = {
            "q": "",
            "filter": {
                "status": ["open", "upcoming"]
            },
            "page": 1,
            "size": 50
        }

        async with httpx.AsyncClient(headers=self.headers) as client:
            try:
                response = await client.post(self.url, json=payload, timeout=15.0)
                response.raise_for_status()
                data = response.json()
                
                hits = data.get('hits', {}).get('hits', [])
                for hit in hits:
                    source = hit.get('_source', {})
                    
                    event_url = source.get('url', '')
                    if not event_url and source.get('slug'):
                        event_url = f"https://{source.get('slug')}.devfolio.co"
                        
                    event = format_event(
                        id=f"devfolio_{source.get('uuid', '')}",
                        title=source.get('name', ''),
                        description=source.get('description', ''),
                        platform="Devfolio",
                        url=event_url,
                        image_url=source.get('cover_img', ''),
                        start_date=source.get('starts_at', ''),
                        end_date=source.get('ends_at', ''),
                        registration_deadline=source.get('application_close_at', ''),
                        event_type="Hackathon",
                        mode=source.get('mode', 'Unknown').title(),
                        location=source.get('location', ''),
                        prize_pool=source.get('prizes', ''),
                        tags=source.get('themes', []),
                        team_size=f"{source.get('team_size_min', 1)}-{source.get('team_size_max', 4)}",
                        eligibility="Open",
                        registration_status="Open"
                    )
                    events.append(event)
            except Exception as e:
                print(f"Error scraping Devfolio: {e}")
                
        return events

if __name__ == "__main__":
    async def test():
        scraper = DevfolioScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on Devfolio")
    asyncio.run(test())
