import asyncio
import json
import os
from scrapers.devfolio import DevfolioScraper
from scrapers.unstop import UnstopScraper
from scrapers.devpost import DevpostScraper
from scrapers.luma import LumaScraper
from scrapers.mlh import MLHScraper
from scrapers.taikai import TaikaiScraper
from scrapers.namespace import NamespaceScraper
from scrapers.hack2skill import Hack2SkillScraper
from scrapers.hackerearth import HackerEarthScraper
from scraper_utils import deduplicate_events

async def main():
    print("Starting the External Events Scraper...")
    
    scrapers = [
        DevfolioScraper(),
        UnstopScraper(),
        DevpostScraper(),
        LumaScraper(),
        MLHScraper(),
        TaikaiScraper(),
        NamespaceScraper(),
        Hack2SkillScraper(),
        HackerEarthScraper()
    ]
    
    # Run all scrapers concurrently
    tasks = [scraper.scrape() for scraper in scrapers]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_events = []
    for idx, result in enumerate(results):
        platform_name = scrapers[idx].__class__.__name__.replace('Scraper', '').lower()
        if isinstance(result, Exception):
            print(f"Scraper failed: {result}")
            # Write empty list or error file if needed
            platform_events = []
        else:
            platform_events = result
            all_events.extend(result)
            
        # Write individual platform JSON
        output_dir = os.path.dirname(os.path.abspath(__file__))
        platform_file = os.path.join(output_dir, f"{platform_name}.json")
        with open(platform_file, 'w', encoding='utf-8') as f:
            json.dump(platform_events, f, ensure_ascii=False, indent=2)
            
    print(f"Total events scraped before deduplication: {len(all_events)}")
    
    # Deduplicate
    unique_events = deduplicate_events(all_events)
    print(f"Total events after deduplication: {len(unique_events)}")
    
    # Write aggregated events.json
    output_file = os.path.join(output_dir, "events.json")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_events, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully saved {len(unique_events)} events to {output_file}")

if __name__ == "__main__":
    asyncio.run(main())
