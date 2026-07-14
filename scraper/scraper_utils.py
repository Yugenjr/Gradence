import json
from datetime import datetime
from dateutil import parser
import re

def normalize_date(date_str: str) -> str:
    """Parses a date string and returns an ISO-8601 formatted string."""
    if not date_str:
        return ""
    try:
        dt = parser.parse(date_str)
        return dt.isoformat()
    except Exception as e:
        # Fallback for weird formats
        return date_str

def clean_html(raw_html: str) -> str:
    """Removes HTML tags from a string."""
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # also replace multiple spaces or newlines
    cleantext = re.sub(r'\s+', ' ', cleantext).strip()
    return cleantext

def format_event(
    id: str,
    title: str,
    description: str,
    platform: str,
    url: str,
    image_url: str,
    start_date: str,
    end_date: str,
    registration_deadline: str,
    event_type: str,
    mode: str,
    location: str,
    prize_pool: str,
    tags: list,
    team_size: str,
    eligibility: str,
    registration_status: str
) -> dict:
    """Normalizes the event format to ensure schema consistency."""
    return {
        "id": id,
        "title": title.strip() if title else "",
        "description": clean_html(description),
        "platform": platform.strip() if platform else "",
        "url": url.strip() if url else "",
        "image_url": image_url.strip() if image_url else "",
        "start_date": normalize_date(start_date),
        "end_date": normalize_date(end_date),
        "registration_deadline": normalize_date(registration_deadline),
        "event_type": event_type.strip() if event_type else "Unknown",
        "mode": mode.strip() if mode else "Unknown",
        "location": str(location).strip() if location else "",
        "prize_pool": str(prize_pool).strip() if prize_pool else "",
        "tags": [str(t).strip() for t in tags if t] if isinstance(tags, list) else [],
        "team_size": str(team_size).strip() if team_size else "",
        "eligibility": eligibility.strip() if eligibility else "",
        "registration_status": registration_status.strip() if registration_status else "Open"
    }

def deduplicate_events(events: list) -> list:
    """Deduplicate events based on URL or ID."""
    seen = set()
    unique_events = []
    for event in events:
        identifier = event.get('url') or event.get('id')
        if identifier and identifier not in seen:
            seen.add(identifier)
            unique_events.append(event)
    return unique_events
