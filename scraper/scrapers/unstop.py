from curl_cffi import requests
import asyncio
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class UnstopScraper:
    def __init__(self):
        self.base_url = "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=100"

    async def scrape(self) -> List[dict]:
        events = []
        try:
            # We use curl_cffi AsyncSession to impersonate a browser and bypass Cloudflare
            async with requests.AsyncSession(impersonate="chrome110") as session:
                # Fetch up to 3 pages (300 events max) to avoid timing out
                for page in range(1, 4):
                    url = f"{self.base_url}&page={page}"
                    response = await session.get(url, timeout=15.0)
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Unstop API structure can vary; find the list of items
                        items = []
                        if isinstance(data, dict):
                            if 'data' in data:
                                inner = data['data']
                                if isinstance(inner, dict) and 'data' in inner:
                                    items = inner['data']
                                elif isinstance(inner, list):
                                    items = inner
                        elif isinstance(data, list):
                            items = data
                            
                        for item in items:
                            if not isinstance(item, dict):
                                continue
                            
                            # Handle fields safely in case they are lists instead of dicts
                            reg_req = item.get('regnRequirements')
                            reg_deadline = ""
                            if isinstance(reg_req, dict):
                                reg_deadline = reg_req.get('end_regn_dt', '')
                                
                            filters = item.get('filters')
                            is_online = False
                            if isinstance(filters, dict):
                                is_online = filters.get('online', False)
                            elif isinstance(filters, list):
                                is_online = 'online' in [str(f).lower() for f in filters]
                                
                            event = format_event(
                                id=f"unstop_{item.get('id', '')}",
                                title=item.get('title', ''),
                                description=item.get('seo_description', ''),
                                platform="Unstop",
                                url=f"https://unstop.com/{item.get('public_url', '')}",
                                image_url=item.get('logoUrl2', '') or item.get('bannerUrl', ''),
                                start_date=item.get('start_date', ''),
                                end_date=item.get('end_date', ''),
                                registration_deadline=reg_deadline,
                                event_type="Hackathon",
                                mode="Online" if is_online else "Hybrid",
                                location=item.get('region', ''),
                                prize_pool=str(item.get('prizeAmount', '')),
                                tags=[tag for tag in item.get('tags', []) if isinstance(tag, str)],
                                team_size=f"{item.get('minMembers', 1)}-{item.get('maxMembers', 4)}",
                                eligibility=item.get('eligible', ''),
                                registration_status="Open" if item.get('status') == 'active' else item.get('status', 'Open')
                            )
                            events.append(event)
                    else:
                        print(f"Error scraping Unstop (Page {page}): Status {response.status_code}")
                        break  # Stop pagination if error occurs
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error scraping Unstop: {e}")
            
        return events

if __name__ == "__main__":
    async def test():
        scraper = UnstopScraper()
        events = await scraper.scrape()
        print(f"Found {len(events)} events on Unstop")
    asyncio.run(test())
