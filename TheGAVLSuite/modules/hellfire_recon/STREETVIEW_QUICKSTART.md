# Street View Reconnaissance - Quick Start Guide

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

## 30-Second Setup

```bash
# 1. Get API key from Google Cloud Console
# https://console.cloud.google.com/apis/credentials

# 2. Enable these APIs:
#    - Maps Static API
#    - Geocoding API
#    - Street View Static API

# 3. Set environment variable
export GOOGLE_MAPS_API_KEY="your_api_key_here"

# 4. Run demo
cd /Users/noone/TheGAVLSuite/modules/hellfire_recon
python examples/streetview_demo.py
```

## Basic Usage

```python
from hellfire_recon.meta_agent import HellfireMetaAgent

agent = HellfireMetaAgent()
ctx = agent.run(
    client="Target Organization",
    address="123 Main St, City, State"
)

# Access results
screenshots = ctx.surface["streetview"]["screenshots"]
print(f"Captured {len(screenshots)} images")
```

## Common Options

```python
# Use coordinates instead of address
ctx = agent.run(
    client="Target",
    coordinates=[37.4224, -122.0842]  # [lat, lng]
)

# Custom camera angles (8 directions = 360° view)
ctx = agent.run(
    client="Target",
    address="123 Main St",
    headings=[0, 45, 90, 135, 180, 225, 270, 315]
)

# Wide angle view
ctx = agent.run(
    client="Target",
    address="123 Main St",
    fov=120  # Field of view in degrees (0-120)
)
```

## Output Location

Images saved to: `reports/hellfire/screenshots/`

Filename format: `{client}_{location_hash}_h{heading}.png`

Example: `target_org_a3f5b2c1_h000.png`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key required" | `export GOOGLE_MAPS_API_KEY="your_key"` |
| "Address not found" | Check spelling or use coordinates |
| "No imagery available" | Location not covered by Street View |
| "Quota exceeded" | Wait for reset or enable billing |

## Cost Estimate

**Free Tier**: $200/month credit

**Per Location** (4 directions):
- 1 geocode: $0.005
- 1 availability check: Free
- 4 images: $0.028
- **Total**: ~$0.033 per location

**Monthly Estimate**: ~6,000 locations free per month

## Full Documentation

For complete documentation, see:
- `STREETVIEW_README.md` - Full documentation
- `STREETVIEW_IMPLEMENTATION_SUMMARY.md` - Technical details
- `examples/streetview_demo.py` - Demo script

## Support

For issues or questions:
1. Check `STREETVIEW_README.md` troubleshooting section
2. Verify API key is set: `echo $GOOGLE_MAPS_API_KEY`
3. Test with demo: `python examples/streetview_demo.py`
4. Check Google Cloud Console for quota/billing

## Security Notice

⚠️ **For authorized penetration testing only**

Ensure you have:
- ✅ Written permission from property owner
- ✅ Clear scope defining target locations
- ✅ Compliance with local laws
- ✅ Data handling procedures

---

**Status**: Production Ready ✅
**Last Updated**: October 14, 2025
