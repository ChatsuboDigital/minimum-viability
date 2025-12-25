// 20 funny confirmation messages that rotate randomly
export const CONFIRMATION_MESSAGES = [
  {
    title: "Wait, are you sure?",
    description: "Like... really sure? No take-backs."
  },
  {
    title: "Hold up...",
    description: "Did you actually work out or are you just clicking buttons?"
  },
  {
    title: "Just checking...",
    description: "You know I'm watching you, right? 👀"
  },
  {
    title: "Verify your vibes",
    description: "Are we doing this or are we doing this?"
  },
  {
    title: "Moment of truth",
    description: "Did the workout happen in real life or just in your mind?"
  },
  {
    title: "Real talk...",
    description: "You earned this or nah?"
  },
  {
    title: "Accountability checkpoint",
    description: "Your partner is watching. Don't lie."
  },
  {
    title: "Sworn testimony required",
    description: "Raise your right hand and confirm."
  },
  {
    title: "No cap?",
    description: "We keeping it 100% here?"
  },
  {
    title: "The council will decide",
    description: "Did you show up or did you show up?"
  },
  {
    title: "Receipts please",
    description: "Where's the proof? (JK, we trust you... kinda)"
  },
  {
    title: "Plot twist",
    description: "What if this is all a simulation?"
  },
  {
    title: "Honest question",
    description: "Did you break a sweat or just your screen?"
  },
  {
    title: "One more time",
    description: "Say it with your chest. Did. You. Work. Out?"
  },
  {
    title: "No judgment but...",
    description: "Actually, full judgment. You better have earned this."
  },
  {
    title: "The truth serum is active",
    description: "Last chance to come clean."
  },
  {
    title: "Viability check",
    description: "Is this minimum or are we just lying to ourselves?"
  },
  {
    title: "Show your work",
    description: "Points will not be awarded without confirmation."
  },
  {
    title: "Final answer?",
    description: "This is your Regis Philbin moment."
  },
  {
    title: "Lock it in?",
    description: "Once you click yes, it's official. No edits."
  }
]

export function getRandomConfirmation() {
  return CONFIRMATION_MESSAGES[Math.floor(Math.random() * CONFIRMATION_MESSAGES.length)]
}
