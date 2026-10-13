"""Run separately: python -m app.scheduler. One worker per deployment."""
import time
import logging
from sqlalchemy.orm import Session
from app.main import engine,auto_close
from app.waha import process_outbox

logging.basicConfig(level=logging.INFO)
last_close=0
while True:
    if time.monotonic()-last_close>=60:
        try:
            with Session(engine) as session:
                count=auto_close(session)
                logging.info('Closed %s overdue tickets',count)
        except Exception:
            logging.exception('Auto-close failed; retrying next minute')
        last_close=time.monotonic()
    try:process_outbox(engine)
    except Exception:logging.error('WhatsApp queue processing failed; retrying next cycle')
    time.sleep(10)
