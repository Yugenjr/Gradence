import httpx
import asyncio
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class TaikaiScraper:
    def __init__(self):
        self.url = "https://api.taikai.network/graphql"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Content-Type": "application/json"
        }

    async def scrape(self) -> List[dict]:
        events = []
        
        query = """
        query Hackathons($where: HackathonWhereInput) {
          hackathons(where: $where) {
            id
            name
            shortDescription
            url
            banner {
              url
            }
            registrationStartDate
            registrationEndDate
            startDate
            endDate
            status
            location
            isVirtual
          }
        }
        """
        
        variables = {
            "where": {
                "status": {"in": ["PUBLISHED", "ONGOING", "REGISTRATIONS_OPEN"]}
            }
        }

        async with httpx.AsyncClient(headers=self.headers) as client:
            try:
                response = await client.post(self.url, json={"query": query, "variables": variables}, timeout=15.0)
                response.raise_for_status()
                data = response.json()
                
                hackathons = data.get('data', {}).get('hackathons', [])
                for hack in hackathons:
                    event = format_event(
                        id=f"taikai_{hack.get('id', '')}",
                        title=hack.get('name', ''),
                        description=hack.get('shortDescription', ''),
                        platform="TAIKAI",
                        url=f"https://taikai.network/en/hackathons/{hack.get('url', '')}",
                        image_url=hack.get('banner', {}).get('url', '') if hack.get('banner') else "",
                        start_date=hack.get('startDate', ''),
                        end_date=hack.get('endDate', ''),
                        registration_deadline=hack.get('registrationEndDate', ''),
                        event_type="Hackathon",
                        mode="Online" if hack.get('isVirtual') else "Hybrid",
                        location=hack.get('location', ''),
                        prize_pool="",
                        tags=[],
                        team_size="",
                        eligibility="Open",
                        registration_status=hack.get('status', 'Open')
                    )
                    events.append(event)
            except Exception as e:
                print(f"Error scraping TAIKAI: {e}")
                
        return events

if __name__ == "__main__":
    async def test():
        scraper = TaikaiScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on TAIKAI")
    asyncio.run(test())
