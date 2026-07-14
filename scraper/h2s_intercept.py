import asyncio
import json
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page()

        api_urls = []

        async def handle_response(response):
            if response.request.resource_type in ["fetch", "xhr"]:
                print(f"XHR/FETCH: {response.url}")
                try:
                    text = await response.text()
                    if len(text) > 500:
                        print(f"  Length: {len(text)}. Snippet: {text[:200]}")
                except:
                    pass

        page.on("response", handle_response)
        print("Navigating to https://hack2skill.com/hackathons ...")
        await page.goto('https://hack2skill.com/hackathons', wait_until='networkidle')
        await page.evaluate("window.scrollBy(0, 1000)")
        await page.wait_for_timeout(2000)
        await page.evaluate("window.scrollBy(0, 1000)")
        await page.wait_for_timeout(5000)
        
        await b.close()

if __name__ == '__main__':
    asyncio.run(run())
