import asyncio
from curl_cffi import requests
import json
import re

async def main():
    async with requests.AsyncSession(impersonate="chrome110") as session:
        r = await session.get("https://hack2skill.com/hackathons")
        print(f"Status: {r.status_code}")
        
        # find all API endpoints mentioned
        urls = re.findall(r'https://[^\"\'\s]+', r.text)
        apis = [u for u in urls if 'api' in u or 'vision' in u]
        print("Possible APIs:")
        for api in set(apis):
            print(api)

if __name__ == "__main__":
    asyncio.run(main())
