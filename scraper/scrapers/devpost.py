from curl_cffi import requests
import asyncio
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class DevpostScraper:
    def __init__(self):
        self.url = "https://devpost.com/api/hackathons"

    async def scrape(self) -> List[dict]:
        events = []
        try:
            # Using curl_cffi to bypass AWS WAF
            async with requests.AsyncSession(impersonate="chrome110") as session:
                response = await session.get(self.url, timeout=15.0)
                if response.status_code == 200:
                    data = response.json()
                    hackathons = data.get('hackathons', [])
                    for hack in hackathons:
                        event = format_event(
                            id=f"devpost_{hack.get('id', '')}",
                            title=hack.get('title', ''),
                            description=hack.get('themes', [{'name': ''}])[0].get('name', ''),
                            platform="Devpost",
                            url=hack.get('url', ''),
                            image_url=hack.get('thumbnail_url', '').replace('//', 'https://'),
                            start_date=hack.get('submission_period_dates', ''),
                            end_date="",
                            registration_deadline="",
                            event_type="Hackathon",
                            mode="Online" if "Online" in hack.get('displayed_location', {}).get('location', '') else "Offline",
                            location=hack.get('displayed_location', {}).get('location', ''),
                            prize_pool=hack.get('prize_amount', ''),
                            tags=[t.get('name') for t in hack.get('themes', [])],
                            team_size="",
                            eligibility="",
                            registration_status="Open" if hack.get('open_state') == "open" else "Closed"
                        )
                        events.append(event)
                else:
                    print(f"Error scraping Devpost: Status {response.status_code}")
        except Exception as e:
            print(f"Error scraping Devpost: {e}")
            
        return events

if __name__ == "__main__":
    async def test():
        scraper = DevpostScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on Devpost")
    asyncio.run(test())
