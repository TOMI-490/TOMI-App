"""
MoodService
Manages avatar mood stats (hunger, sleepiness, boredom, happiness).
Mood is affected by workouts and by explicit Feed / Rest actions.
"""

import logging
import time
from typing import Optional

from ...Infrastructure.Repository.UserAvatarRepository import UserAvatarRepository

logger = logging.getLogger(__name__)

FEED_COOLDOWN_SECONDS = 30 * 60   # 30 minutes
REST_COOLDOWN_SECONDS = 30 * 60


def _clamp(value: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, value))


class MoodService:

    def __init__(self, user_avatar_repo: UserAvatarRepository):
        self.repo = user_avatar_repo
        self._feed_cooldowns: dict[int, float] = {}
        self._rest_cooldowns: dict[int, float] = {}

    # ── Workout boost ──────────────────────────────────────────────────

    def apply_workout_boost(self, user_id: int, duration_minutes: int) -> Optional[dict]:
        """Improve all four mood stats after a completed workout."""
        try:
            avatar = self.repo.fetchAvatarByUserId(user_id)
            if not avatar:
                logger.warning(f"[MoodService] No avatar for user {user_id}")
                return None

            hunger_delta   = -min(30, max(10, duration_minutes))
            sleep_delta    = -min(25, max(8,  duration_minutes * 2 // 3))
            boredom_delta  = -min(35, max(10, duration_minutes))
            happy_delta    =  min(30, max(10, duration_minutes))

            new_hunger   = _clamp(avatar.hunger_level   + hunger_delta)
            new_sleep    = _clamp(avatar.sleepiness_level + sleep_delta)
            new_boredom  = _clamp(avatar.boredome_level + boredom_delta)
            new_happy    = _clamp(avatar.happines_level + happy_delta)

            self.repo.updateUserAvatarFields(avatar.user_avatar_id, {
                'hunger_level':     new_hunger,
                'sleepiness_level': new_sleep,
                'boredome_level':   new_boredom,
                'happines_level':   new_happy,
            })

            result = {
                'hunger_delta':   hunger_delta,
                'sleep_delta':    sleep_delta,
                'boredom_delta':  boredom_delta,
                'happy_delta':    happy_delta,
            }
            logger.info(f"[MoodService] Workout boost for user {user_id}: {result}")
            return result

        except Exception as e:
            logger.error(f"[MoodService] Error applying workout boost: {e}")
            return None

    # ── Feed action ────────────────────────────────────────────────────

    def feed(self, user_id: int) -> dict:
        """Reduce hunger and slightly boost happiness. Enforces cooldown."""
        self._check_cooldown(user_id, self._feed_cooldowns, FEED_COOLDOWN_SECONDS, "feed")

        avatar = self.repo.fetchAvatarByUserId(user_id)
        if not avatar:
            raise ValueError("User avatar not found")

        new_hunger = _clamp(avatar.hunger_level - 25)
        new_happy  = _clamp(avatar.happines_level + 5)

        updated = self.repo.updateUserAvatarFields(avatar.user_avatar_id, {
            'hunger_level':   new_hunger,
            'happines_level': new_happy,
        })

        self._feed_cooldowns[user_id] = time.time()
        logger.info(f"[MoodService] Feed user {user_id}: hunger {avatar.hunger_level}->{new_hunger}")
        return updated.__dict__

    # ── Rest action ────────────────────────────────────────────────────

    def rest(self, user_id: int) -> dict:
        """Reduce sleepiness and slightly boost happiness. Enforces cooldown."""
        self._check_cooldown(user_id, self._rest_cooldowns, REST_COOLDOWN_SECONDS, "rest")

        avatar = self.repo.fetchAvatarByUserId(user_id)
        if not avatar:
            raise ValueError("User avatar not found")

        new_sleep = _clamp(avatar.sleepiness_level - 25)
        new_happy = _clamp(avatar.happines_level + 5)

        updated = self.repo.updateUserAvatarFields(avatar.user_avatar_id, {
            'sleepiness_level': new_sleep,
            'happines_level':   new_happy,
        })

        self._rest_cooldowns[user_id] = time.time()
        logger.info(f"[MoodService] Rest user {user_id}: sleep {avatar.sleepiness_level}->{new_sleep}")
        return updated.__dict__

    # ── Cooldown helper ────────────────────────────────────────────────

    def remaining_cooldown(self, user_id: int, action: str) -> int:
        """Return seconds remaining on the cooldown, or 0 if ready."""
        store = self._feed_cooldowns if action == "feed" else self._rest_cooldowns
        cd    = FEED_COOLDOWN_SECONDS if action == "feed" else REST_COOLDOWN_SECONDS
        last  = store.get(user_id, 0)
        remaining = int(cd - (time.time() - last))
        return max(0, remaining)

    @staticmethod
    def _check_cooldown(user_id: int, store: dict, duration: float, label: str):
        last = store.get(user_id, 0)
        elapsed = time.time() - last
        if elapsed < duration:
            remaining = int(duration - elapsed)
            mins = remaining // 60
            secs = remaining % 60
            raise CooldownError(f"{label.capitalize()} is on cooldown. Try again in {mins}m {secs}s.", remaining)


class CooldownError(Exception):
    """Raised when a feed/rest action is attempted before the cooldown expires."""
    def __init__(self, message: str, remaining_seconds: int):
        super().__init__(message)
        self.remaining_seconds = remaining_seconds
