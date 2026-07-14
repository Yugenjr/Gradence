import httpx
import asyncio
from bs4 import BeautifulSoup
from typing import List
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class LumaScraper:
    def __init__(self):
        # Luma's discover endpoint or a specific search (e.g., Tech events in a city)
        self.url = "https://lu.ma/explore"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }

    async def scrape(self) -> List[dict]:
        events = []
        async with httpx.AsyncClient(headers=self.headers, follow_redirects=True) as client:
            try:
                # Note: Luma heavily relies on JS and Next.js __NEXT_DATA__
                # A direct GET might only get limited initial state without Playwright
                response = await client.get(self.url, timeout=15.0)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                
                next_data = soup.find("script", id="__NEXT_DATA__")
                if next_data:
                    data = json.loads(next_data.string)
                    # This would need to be adapted based on Luma's current exact state tree
                    # Often it's under props -> pageProps -> initialData
                    print("Luma __NEXT_DATA__ found. Proceeding with extraction...")
                else:
                    # Fallback to simple HTML parsing if possible
                    event_cards = soup.select("a.event-card")
                    for card in event_cards:
                        title_elem = card.select_one(".title")
                        title = title_elem.text if title_elem else ""
                        url = card.get("href", "")
                        if url and not url.startswith("http"):
                            url = "https://lu.ma" + url
                            
                        event = format_event(
                            id=f"luma_{url.split('/')[-1]}",
                            title=title,
                            description="",
                            platform="Luma",
                            url=url,
                            image_url="",
                            start_date="",
                            end_date="",
                            registration_deadline="",
                            event_type="Meetup/Event",
                            mode="Unknown",
                            location="",
                            prize_pool="",
                            tags=[],
                            team_size="",
                            eligibility="Open",
                            registration_status="Open"
                        )
                        events.append(event)
            except Exception as e:
                print(f"Error scraping Luma: {e}")
                
        return events

if __name__ == "__main__":
    async def test():
        scraper = LumaScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on Luma")
    asyncio.run(test())
