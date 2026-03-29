---- MODULE ActivationCoordinator ----
EXTENDS Naturals, Sequences, FiniteSets

CONSTANTS Sessions, MaxPending

VARIABLES state, pending, activeSession, clock

StateSet == {"idle", "activating", "active", "deactivating"}

Init ==
  /\ state = "idle"
  /\ pending = {}
  /\ activeSession = NULL
  /\ clock = 0

RequestActivation(session) ==
  /\ state = "idle"
  /\ session \in Sessions
  /\ pending' = pending \cup {session}
  /\ state' = "activating"
  /\ activeSession' = session
  /\ clock' = clock + 1

CompleteActivation ==
  /\ state = "activating"
  /\ pending' = pending \ {activeSession}
  /\ state' = "active"
  /\ clock' = clock + 1

RequestDeactivation ==
  /\ state = "active"
  /\ pending' = pending
  /\ state' = "deactivating"
  /\ activeSession' = NULL
  /\ clock' = clock + 1

CompleteDeactivation ==
  /\ state = "deactivating"
  /\ state' = "idle"
  /\ pending' = {}
  /\ clock' = clock + 1

StaleRequestArrives ==
  /\ state \in {"activating", "active"}
  /\ \E other \in pending:
        other.timestamp > IF activeSession = NULL THEN 0 ELSE activeSession.timestamp
  /\ pending' = pending
  /\ state' = state
  /\ activeSession' = activeSession
  /\ clock' = clock + 1

Next ==
  \/ \E session \in Sessions: RequestActivation(session)
  \/ CompleteActivation
  \/ RequestDeactivation
  \/ CompleteDeactivation
  \/ StaleRequestArrives

NoDoubleActivation ==
  Cardinality(pending) <= 1

NoStaleActivation ==
  /\ state = "active"
  /\ activeSession # NULL
  => \A s \in pending : s.timestamp < activeSession.timestamp

EventualResolution ==
  []( state = "activating" => <> (state = "deactivating") )

Spec == Init /\ [][Next]_<<state, pending, activeSession, clock>>

====
