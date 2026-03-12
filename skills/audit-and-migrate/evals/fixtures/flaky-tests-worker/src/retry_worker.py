import time


class RetryWorker:
    def __init__(self, clock=time):
        self.clock = clock
        self.attempts = 0

    def run(self, max_attempts: int = 3) -> int:
        while self.attempts < max_attempts:
            self.attempts += 1
            self.clock.sleep(0.2)
        return self.attempts
