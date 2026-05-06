import sys
import asyncio
import traceback
sys.path.append('.')
from main import process_audio, TranscriptionRequest

async def test():
    req = TranscriptionRequest(call_id='CALL-E04248', text='bachao', language='auto')
    try:
        await process_audio(req)
        print("SUCCESS")
    except Exception as e:
        traceback.print_exc()

asyncio.run(test())
