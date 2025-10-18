# HELLFIRE Street View Reconnaissance

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

## Overview

The Street View reconnaissance module provides automated capture of street-level imagery using the Google Maps Static Street View API. This enables physical security assessment and entry point identification during authorized penetration testing engagements.

## Features

- **Address Geocoding**: Automatically converts street addresses to coordinates
- **Multi-Angle Capture**: Captures imagery from multiple camera headings (N, E, S, W by default)
- **Availability Checking**: Validates Street View imagery exists before attempting capture
- **Rate Limiting**: Respects API quotas with configurable rate limits (default: 1 call/second)
- **Error Handling**: Comprehensive error handling with exponential backoff retry logic
- **PNG Validation**: Verifies captured images are valid PNG format
- **Detailed Logging**: Full audit trail of all API calls and operations

## Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - **Maps Static API** (for Street View images)
   - **Geocoding API** (for address-to-coordinates conversion)
   - **Street View Static API** (for imagery metadata)
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > API Key**
6. (Optional but recommended) Restrict the key:
   - **Application restrictions**: IP addresses (specify your server IPs)
   - **API restrictions**: Limit to Maps Static API, Geocoding API, Street View Static API

### 2. Set Environment Variable

```bash
# Linux/macOS
export GOOGLE_MAPS_API_KEY="your_api_key_here"

# Windows (PowerShell)
$env:GOOGLE_MAPS_API_KEY="your_api_key_here"

# Or add to ~/.bashrc, ~/.zshrc, or environment config
echo 'export GOOGLE_MAPS_API_KEY="your_api_key_here"' >> ~/.bashrc
```

### 3. Verify Setup

```bash
# Check environment variable is set
echo $GOOGLE_MAPS_API_KEY

# Test with Python
python -c "import os; print('API Key:', 'SET' if os.getenv('GOOGLE_MAPS_API_KEY') else 'NOT SET')"
```

## Usage

### Basic Usage (Address)

```python
from hellfire_recon.meta_agent import HellfireMetaAgent

agent = HellfireMetaAgent()
ctx = agent.run(
    client="Target Organization",
    address="1600 Amphitheatre Parkway, Mountain View, CA"
)

# Access results
streetview = ctx.surface.get("streetview", {})
print(f"Captured {len(streetview.get('screenshots', []))} images")
print(f"Location: {streetview.get('address')}")
print(f"Coordinates: {streetview.get('coordinates')}")
```

### Advanced Usage (Coordinates)

```python
# Use exact coordinates instead of address
ctx = agent.run(
    client="Target Organization",
    coordinates=[37.4224764, -122.0842499]  # [latitude, longitude]
)
```

### Custom Configuration

```python
# Custom camera angles and settings
ctx = agent.run(
    client="Target Organization",
    address="123 Main St, Anytown, USA",
    headings=[0, 45, 90, 135, 180, 225, 270, 315],  # 8 directions
    size="640x640",  # Image size (max 640x640 for free tier)
    fov=120,  # Field of view (0-120 degrees)
    skip_availability_check=False  # Check availability first
)
```

### Direct Task Usage

```python
from hellfire_recon.tasks.streetview import StreetViewTask
from hellfire_recon.meta_agent import ReconContext

task = StreetViewTask()
ctx = ReconContext(client="Target Organization")

task.execute(ctx, options={
    "address": "123 Main St, Anytown, USA",
    "headings": [0, 90, 180, 270],
    "size": "640x640",
    "fov": 90
})

# Check results
if ctx.surface.get("streetview", {}).get("screenshots"):
    print("Success! Images saved to:", ctx.surface["streetview"]["screenshots"])
else:
    print("Error:", ctx.surface.get("streetview", {}).get("error"))
```

## Output

### File Structure

Images are saved to `reports/hellfire/screenshots/` with the following naming convention:

```
{client_name}_{location_hash}_h{heading}.png
```

Example: `target_organization_a3f5b2c1_h000.png`

- `target_organization`: Sanitized client name
- `a3f5b2c1`: MD5 hash of location (first 8 chars)
- `h000`: Heading angle (000 = North, 090 = East, 180 = South, 270 = West)

### Context Surface Data

The task populates `ctx.surface["streetview"]` with:

```python
{
    "address": "1600 Amphitheatre Parkway, Mountain View, CA",  # If address provided
    "coordinates": {"lat": 37.4224764, "lng": -122.0842499},
    "available": True,  # Street View imagery availability
    "screenshots": [
        "reports/hellfire/screenshots/client_hash_h000.png",
        "reports/hellfire/screenshots/client_hash_h090.png",
        "reports/hellfire/screenshots/client_hash_h180.png",
        "reports/hellfire/screenshots/client_hash_h270.png"
    ],
    "headings": [0, 90, 180, 270],  # Camera angles used
    "api_calls": 6,  # Total API calls (1 geocode + 1 metadata + 4 images)
    "notes": "Captured street-level imagery from 4 angles. Analyze images for: ..."
}
```

### Error Handling

If errors occur, the surface includes:

```python
{
    "error": "Geocoding failed: Address not found",
    "notes": "Street View API unavailable. Set GOOGLE_MAPS_API_KEY environment variable...",
    "errors": ["Street View capture failed: API key invalid or quota exceeded"]
}
```

## API Quotas and Pricing

### Free Tier (as of 2025)

Google provides $200 monthly credit, which includes:

- **Street View Static API**: $7 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests
- **Approximate free usage**: ~10,000 Street View images + geocoding per month

### Rate Limits

- Default: **1 call per second** (conservative)
- Adjustable via `StreetViewClient(rate_limit=2.0)` for 2 calls/second
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)

### Quota Management

```python
# Track API usage
from hellfire_recon.tasks.streetview import StreetViewClient

client = StreetViewClient(rate_limit=1.0)
# ... perform operations ...
print(f"API calls this session: {client.session_call_count}")
```

## Troubleshooting

### "API key required" Error

**Problem**: `GOOGLE_MAPS_API_KEY` environment variable not set

**Solution**:
```bash
export GOOGLE_MAPS_API_KEY="your_key_here"
# Verify
echo $GOOGLE_MAPS_API_KEY
```

### "API key invalid or quota exceeded" Error

**Problem**: API key is incorrect or you've exceeded quota

**Solutions**:
1. Verify API key is correct in Google Cloud Console
2. Check quotas in [API Dashboard](https://console.cloud.google.com/apis/dashboard)
3. Enable billing if you've exceeded free tier
4. Ensure Street View Static API is enabled for your project

### "Address not found" Error

**Problem**: Geocoding API couldn't resolve the address

**Solutions**:
1. Verify address spelling and format
2. Use more specific address (include city, state, country)
3. Try coordinates directly instead: `coordinates=[lat, lng]`

### "No Street View imagery available" Error

**Problem**: Location doesn't have Street View coverage

**Solutions**:
1. Check coverage at [Google Maps](https://maps.google.com) (drag the yellow person icon)
2. Try nearby address
3. Some areas (military bases, private property) don't have coverage
4. Use `skip_availability_check=True` to attempt capture anyway

### Network/Timeout Errors

**Problem**: Network connectivity or slow responses

**Solutions**:
1. Check internet connection
2. Retry - module automatically retries with exponential backoff (3 attempts)
3. Increase timeout if on slow connection (requires code modification)

## Security Considerations

### Authorized Use Only

This tool is for **authorized security assessments only**. Ensure you have:

1. Written permission from the property owner or organization
2. Clear scope defining which locations can be photographed
3. Compliance with local laws regarding reconnaissance and photography
4. Data handling procedures for captured imagery

### API Key Security

**DO NOT**:
- Commit API keys to version control
- Share API keys publicly
- Use same key across multiple projects without restrictions

**DO**:
- Store keys in environment variables
- Use key restrictions (IP addresses, API limits)
- Rotate keys regularly
- Monitor usage for anomalies
- Revoke compromised keys immediately

### Privacy Considerations

- Street View imagery is public data (already available on Google Maps)
- However, use of this data for reconnaissance should be authorized
- Follow responsible disclosure practices
- Respect privacy laws and regulations (GDPR, CCPA, etc.)

## Integration with HellfireReportTask

The captured images are automatically included in the final HELLFIRE report:

```python
# The report task accesses Street View data
report_data = ctx.surface.get("streetview", {})

# Images are referenced in the PDF/HTML report
screenshots = report_data.get("screenshots", [])
notes = report_data.get("notes", "")
```

The report includes:
- All captured images with compass headings
- Location coordinates and address
- Reconnaissance notes highlighting potential entry points
- Security observations checklist

## API Reference

### StreetViewClient

```python
class StreetViewClient:
    def __init__(
        self,
        api_key: Optional[str] = None,  # Defaults to GOOGLE_MAPS_API_KEY env var
        rate_limit: float = 1.0,  # Calls per second
        max_retries: int = 3  # Retry attempts
    )

    def geocode_address(self, address: str) -> tuple[float, float]:
        """Convert address to (latitude, longitude)"""

    def check_streetview_availability(
        self,
        lat: float,
        lng: float,
        radius: int = 50  # Search radius in meters
    ) -> bool:
        """Check if Street View imagery exists"""

    def capture_streetview(
        self,
        lat: float,
        lng: float,
        heading: int = 0,  # Camera direction (0-360)
        size: str = "640x640",  # Image dimensions
        fov: int = 90,  # Field of view (0-120)
        pitch: int = 0  # Camera pitch (-90 to 90)
    ) -> bytes:
        """Capture single Street View image"""

    def capture_multi_angle(
        self,
        lat: float,
        lng: float,
        headings: Optional[list[int]] = None,  # Default: [0, 90, 180, 270]
        **kwargs
    ) -> dict[int, bytes]:
        """Capture images from multiple angles"""
```

### StreetViewTask

```python
class StreetViewTask(HellfireTask):
    name = "streetview-recon"

    def execute(self, ctx: ReconContext, *, options: dict[str, Any]) -> None:
        """
        Execute street-level reconnaissance.

        Options:
            address: Street address to photograph
            coordinates: [lat, lng] if address not provided
            headings: List of camera angles (default: [0, 90, 180, 270])
            size: Image size (default: "640x640")
            fov: Field of view (default: 90)
            skip_availability_check: Skip availability check (default: False)
        """
```

## Examples

### Example 1: Corporate Office

```python
agent = HellfireMetaAgent()
ctx = agent.run(
    client="Acme Corp",
    address="100 Corporate Blvd, Business Park, CA"
)

# Analyze captured imagery
for screenshot in ctx.surface["streetview"]["screenshots"]:
    print(f"Review image: {screenshot}")
    # Look for: entry points, security cameras, access control, parking
```

### Example 2: Custom 360° View

```python
# Capture 8 directions for full 360° coverage
ctx = agent.run(
    client="Target Site",
    address="456 Industrial Way, Factory Town, TX",
    headings=[0, 45, 90, 135, 180, 225, 270, 315]  # Every 45°
)
```

### Example 3: Coordinates Only

```python
# Use exact coordinates (no geocoding needed)
ctx = agent.run(
    client="Remote Facility",
    coordinates=[34.0522, -118.2437],  # Los Angeles coordinates
    headings=[0, 180]  # Just front and back
)
```

### Example 4: Error Handling

```python
try:
    ctx = agent.run(client="Test Site", address="Invalid Address 123")
except Exception as e:
    print(f"Recon failed: {e}")

# Check for errors in context
if "error" in ctx.surface.get("streetview", {}):
    print("Error:", ctx.surface["streetview"]["error"])
    print("Notes:", ctx.surface["streetview"].get("notes"))
```

## Best Practices

1. **Pre-flight Checks**: Always verify API key is set before running engagements
2. **Availability Checks**: Don't skip availability checks unless necessary (saves quota)
3. **Rate Limiting**: Keep default 1 call/second to avoid hitting quotas
4. **Error Handling**: Check `ctx.surface["streetview"]["error"]` before assuming success
5. **Data Retention**: Archive captured images securely per engagement data retention policy
6. **Quota Monitoring**: Track `api_calls` field to monitor usage
7. **Manual Review**: Always manually review captured images before including in reports

## Contributing

For bugs, improvements, or feature requests related to Street View reconnaissance:

1. Check existing issues
2. Test thoroughly with various addresses and scenarios
3. Include API key requirements in documentation
4. Follow defensive security coding practices
5. Respect API quotas and rate limits

## License

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

This module is part of TheGAVLSuite and is provided for authorized security assessment purposes only.
