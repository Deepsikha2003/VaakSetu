import sys
sys.path.insert(0, 'd:/VaakSetu/backend')
from keywords import KeywordEngine

kw = KeywordEngine()
result = kw.scan('bacchaop, kill me, maar raha hai')
print(f"Total hits: {result['total_hits']}")
print(f"Severity: {result['severity']}")
for h in result['hits']:
    orig = f' from "{h["original"]}"' if 'original' in h else ''
    print(f"  {h['keyword']} (T{h['tier']}) [{h['match_type']}]{orig}")
