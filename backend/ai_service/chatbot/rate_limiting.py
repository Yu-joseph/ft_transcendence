import redis
from datetime import datetime, timedelta
from extensions import db
from database.models import UserUsage


r = redis.Redis(host="redis", port=6379, decode_responses=True)

LIMIT_PER_MINUTE = 10
LIMIT_PER_DAY    = 1000
SYNC_EVERY       = 10
SAFETY_ZONE      = 50 



def sync_to_postgres(user_id: str, daily_count: int):
    try:
        # usage = UserUsage.query.get(user_id)
        usage = db.session.get(UserUsage, user_id)

        if not usage:
            usage = UserUsage(user_id=user_id, daily_count=daily_count , updated_at=datetime.utcnow())
            db.session.add(usage)
        else:
            usage.daily_count = daily_count
            usage.updated_at = datetime.utcnow()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[SYNC ERROR] {e}")


def seconds_until_midnight():
    now = datetime.utcnow()
    tomorrow  = (now  + timedelta(days=1)).replace(hour=0 , minute=0, second=0, microsecond=0)
    return int((tomorrow - now).total_seconds() )



def restore_from_postgres(user_id  : str) -> int:
    # usage = UserUsage.query.get(user_id)
    usage = db.session.get(UserUsage, user_id)

    today = datetime.utcnow().date()

    print(f"usage = {usage} \n")
    print(f"today = {today} \n")
    if usage and usage.updated_at and usage.updated_at.date() == today:
        return usage.daily_count
    return 0




def check_rate_limit_postgres_only(user_id: str):
    try:
        # usage = UserUsage.query.get(user_id)
        usage = db.session.get(UserUsage, user_id)

        today = datetime.utcnow().date()

        if not usage:
            usage = UserUsage(user_id=user_id , daily_count=0 , updated_at=datetime.utcnow() )
            db.session.add(usage)
        
        if usage.updated_at and usage.updated_at.date() != today:
            usage.daily_count = 0
        
        if usage.daily_count >= LIMIT_PER_DAY:
            return False
        
        usage.daily_count +=1
        usage.updated_at = datetime.utcnow()
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"[DB FALLBACK ERROR] {e}")
        return True

def check_rate_limit(user_id : str):
    minute_key = f"rate:minute:{user_id}"
    daily_key  = f"rate:daily:{user_id}"
    try:
        daily_count = r.get(daily_key)

        if daily_count is None:
            restored = restore_from_postgres(user_id)
            r.set(daily_key , restored , ex=seconds_until_midnight())
            daily_count = restored
        else:
            daily_count = int(daily_count)

        if daily_count >= LIMIT_PER_DAY :
            return False
        
        minute_count  = r.get(minute_key)
        if minute_count and int(minute_count) >= LIMIT_PER_MINUTE:
            return False
        
        print(f"daily_count ={daily_count} ")
        print(f"minute_count ={minute_count} ")

        pipe = r.pipeline()

        pipe.incr(minute_key)
        pipe.expire(minute_key, 60 )

        pipe.incr(daily_key)
        pipe.expire(daily_key , seconds_until_midnight())

        results = pipe.execute()
        print(f"result = {results}")

        new_daily = results[2]

        if new_daily % SYNC_EVERY == 0 or new_daily >= LIMIT_PER_DAY - SAFETY_ZONE:
            sync_to_postgres(user_id, new_daily)
        
        return True

    
    
    except redis.RedisError as e:
        print(f"[REDIS DOWN] {e} — falling back to Postgres")
        return  check_rate_limit_postgres_only(user_id)

