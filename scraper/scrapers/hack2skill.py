import asyncio
import xml.etree.ElementTree as ET
from curl_cffi import requests
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scraper_utils import format_event

class Hack2SkillScraper:
    def __init__(self):
        self.sitemap_url = "https://hack2skill.com/sitemap.xml"
        self.session = requests.AsyncSession(impersonate="chrome110")

    async def scrape(self) -> List[dict]:
        events = []
        try:
            response = await self.session.get(self.sitemap_url, timeout=10)
            if response.status_code == 200:
                root = ET.fromstring(response.text)
                ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                urls = [loc.text for loc in root.findall('.//ns:loc', ns)]
                
                # Filter for event URLs
                event_urls = [u for u in urls if '/event/' in u or 'hackathon' in u]
                
                # We will limit to the first 20 events to avoid massive JSON sizes initially
                # but we can take all active ones if we sort or check them. Since we don't have
                # start dates easily available without scraping each page, we just format them.
                for url in event_urls[:50]:
                    slug = url.rstrip('/').split('/')[-1]
                    # Title case the slug and replace hyphens
                    title = slug.replace('-', ' ').replace('_', ' ').title()
                    
                    event = format_event(
                        id=f"h2s_{slug}",
                        title=title,
                        description=f"Hack2Skill Event: {title}",
                        platform="Hack2Skill",
                        url=url,
                        image_url="https://hack2skill.com/images/logo.png",
                        start_date="",
                        end_date="",
                        registration_deadline="",
                        event_type="Hackathon/Event",
                        mode="Online/Offline",
                        location="",
                        prize_pool="Check Website",
                        tags=["Hack2Skill"],
                        team_size="Check Website",
                        eligibility="Open to all",
                        registration_status="Open"
                    )
                    events.append(event)
                    
                print(f"Scraped {len(events)} events from Hack2Skill sitemap.")
            else:
                print(f"Failed to fetch Hack2Skill sitemap. Status: {response.status_code}")
                
        except Exception as e:
            print(f"Error scraping Hack2Skill: {e}")
        finally:
            await self.session.close()
            
        return events

if __name__ == "__main__":
    asyncio.run(Hack2SkillScraper().scrape())
