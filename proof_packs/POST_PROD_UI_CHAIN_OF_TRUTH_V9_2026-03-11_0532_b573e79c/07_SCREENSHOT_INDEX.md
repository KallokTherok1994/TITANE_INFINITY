# 07 Screenshot Index

Run1:
- artifacts/run1/screens/run1-before-input.png
- artifacts/run1/screens/run1-after-input.png
- artifacts/run1/screens/run1-after-response.png

Run2:
- artifacts/run2/screens/run2-before-input.png
- artifacts/run2/screens/run2-after-input.png
- artifacts/run2/screens/run2-after-response.png

Sizes:
- See artifacts/screenshot_sizes.txt

SHA256:
- See artifacts/screenshot_sha256.txt

Capture protocol:
- before-input: after chat surface readiness, before user text injection
- after-input: immediately after input value set
- after-response: after visible response update assertion

Visual comparison note:
- artifacts/visual_compare.txt => compare_not_available (ImageMagick compare not installed)
- Fallback consistency proof uses structural runtime audit parity:
	- same marker booleans in run1/run2 JSON
	- same non-zero input/send bounding boxes
	- same onboarding absence and response visibility
