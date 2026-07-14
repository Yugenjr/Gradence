import httpx
import asyncio
from bs4 import BeautifulSoup
from typing import List
import sys
import os
import datetime

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class MLHScraper:
    def __init__(self):
        current_year = datetime.datetime.now().year
        # Start with current year, MLH updates this URL
        self.url = f"https://mlh.io/seasons/{current_year}/events"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

    async def scrape(self) -> List[dict]:
        events = []
        async with httpx.AsyncClient(headers=self.headers, follow_redirects=True) as client:
            try:
                response = await client.get(self.url, timeout=15.0)
                if response.status_code == 404:
                    # Try next year if current year is over
                    self.url = f"https://mlh.io/seasons/{datetime.datetime.now().year + 1}/events"
                    response = await client.get(self.url, timeout=15.0)
                    
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                
                hackathons = soup.select(".event-wrapper")
                for hack in hackathons:
                    title_elem = hack.select_one(".event-name")
                    title = title_elem.text.strip() if title_elem else ""
                    
                    url_elem = hack.select_one("a.event-link")
                    url = url_elem["href"] if url_elem else ""
                    
                    img_elem = hack.select_one(".event-logo img")
                    img_url = img_elem["src"] if img_elem else ""
                    
                    date_elem = hack.select_one(".event-date")
                    date_str = date_elem.text.strip() if date_elem else ""
                    
                    location_elem = hack.select_one(".event-location")
                    location = location_elem.text.strip() if location_elem else ""
                    mode = "Offline"
                    if "Digital" in location or "Virtual" in location:
                        mode = "Online"
                        
                    mode_elem = hack.select_one(".event-hybrid-notes")
                    if mode_elem and "Hybrid" in mode_elem.text:
                        mode = "Hybrid"
                    
                    event = format_event(
                        id=f"mlh_{title.replace(' ', '_').lower()}",
                        title=title,
                        description="",
                        platform="MLH",
                        url=url,
                        image_url=img_url,
                        start_date=date_str.split('-')[0].strip() if '-' in date_str else date_str,
                        end_date=date_str.split('-')[1].strip() if '-' in date_str else "",
                        registration_deadline="",
                        event_type="Hackathon",
                        mode=mode,
                        location=location,
                        prize_pool="",
                        tags=[],
                        team_size="1-4",
                        eligibility="Student",
                        registration_status="Open"
                    )
                    events.append(event)
            except Exception as e:
                print(f"Error scraping MLH: {e}")
                
        return events

if __name__ == "__main__":
    async def test():
        scraper = MLHScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on MLH")
    asyncio.run(test())
