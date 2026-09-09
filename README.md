# 🐦 DoodleBird

> A doodle-style, fan-inspired browser game built around classic
> endless-flyer gameplay.

DoodleBird is a fan-inspired browser game project based on the classic
gameplay formula of Flappy Bird. We tried to recreate the simple,
addictive feel of the original while giving the project its own visual
identity, doodle/crayon artwork, interface, sounds, and additional
challenge modes.

The goal is simple: keep the bird flying, pass through the pipes, avoid
collisions, and beat your best score.

---

## 👤 Author

**Ketan**

- GitHub: [@ketanofc](https://github.com/ketanofc)
- Twitter / X: [@ketanofc](https://twitter.com/ketanofc)

---

## ✨ Features

- 🐦 Simple one-button flying gameplay
- 🎨 Original doodle/crayon-inspired visual style
- 🌤️ Scrolling sky, clouds, city, and ground
- 🟢 Doodle-style pipes and obstacles
- 🪽 Multi-frame bird animation
- 🏆 Score and best-score tracking
- 🎮 Multiple challenge modes
- 🔄 Instant restart
- 📤 Share-score functionality
- 🔊 Sound effects and game feedback
- 📱 Responsive desktop and mobile support
- ⚡ Lightweight browser gameplay
- 💾 Local best-score persistence
- 🥇 Optional online leaderboard
- 🛡️ Basic server-side score validation

---

## 🎮 Game Overview

DoodleBird uses a simple gameplay loop:

1. Start the game.
2. Tap, click, or press the assigned key to make the bird fly upward.
3. Gravity pulls the bird downward when you are not flapping.
4. Navigate through the gaps between pipes.
5. Each successfully passed pipe increases your score.
6. Avoid pipes, the ground, and other collision zones.
7. Continue as long as possible and try to beat your best score.

The controls are intentionally simple. The challenge comes from timing,
rhythm, reaction speed, and consistency.

---

## 🕹️ Controls

| Platform | Action                      |
| -------- | ---------------------------- |
| Desktop  | `Space` / Mouse Click         |
| Mobile   | Tap the screen                |
| Restart  | Restart button                |
| Pause    | Pause control, if enabled     |

The exact controls may vary between builds.

---

# 🎯 Game Modes

### Classic Mode

The standard DoodleBird experience.

- Normal gravity
- Standard pipe spacing
- Normal movement speed
- Traditional scoring
- Designed to be easy to learn and difficult to master

### Challenge Mode

A harder mode for experienced players.

Possible changes include:

- Faster pipe movement
- Smaller gaps
- More demanding obstacle patterns
- Increasing difficulty
- Higher scoring potential

### Endless Mode

Survive for as long as possible while the difficulty gradually
increases.

Difficulty can be based on:

- Score
- Time survived
- Movement speed
- Pipe spacing
- Spawn patterns

Additional modes can be added without changing the core gameplay.

---

# 🏆 Scoring System

Players receive points when the bird successfully passes an obstacle
pair.

Example:

```text
Score: 25
Best: 42
```

## Best Score

The best score can be stored locally using browser `localStorage`.

If an online leaderboard is enabled, a verified score can also be
submitted to the leaderboard.

## Fair Play

Browser games are difficult to completely protect from cheating because
the game client runs on the player's device.

Please do not:

- Modify game files to create artificial scores
- Manipulate browser storage
- Alter network requests
- Submit fabricated scores
- Use automation to gain an unfair advantage

The leaderboard is intended to represent genuine gameplay.

---

# 🥇 Leaderboard

DoodleBird can include a leaderboard where players compete with friends
and other players.

Example:

| Rank | Player       | Score |
| ---- | ------------ | ----- |
| 1    | Player One   | 120   |
| 2    | Player Two   | 98    |
| 3    | Player Three | 87    |

For online scores, the server should validate submissions where
possible.

Possible validation checks include:

- Impossible score increases
- Invalid game sessions
- Impossible game durations
- Duplicate or suspicious submissions
- Abnormally high scores

No client-side anti-cheat system can be considered completely secure.

---

# 🎨 Art & Visual Design

DoodleBird uses an original hand-drawn visual direction inspired by
doodles, crayons, children's sketches, and simple arcade artwork.

The game can contain:

- 🐦 Bird sprite animation
- 🟢 Pipe sprites
- ☁️ Cloud sprites
- 🌆 City/background artwork
- 🌱 Grass and ground
- ⭐ Decorative effects
- 🪙 Optional collectibles
- 💎 Optional bonus elements
- ❤️ Optional life indicators
- 🏆 Score panel
- 🔄 Restart button
- 📤 Share button
- 💥 Game-over interface

The goal is to keep the interface playful, readable, lightweight, and
visually consistent.

---

# 🐦 Bird Animation

The bird uses multiple sprite frames to create a simple flap animation.

Typical animation:

```text
Idle
 ↓
Flap Up
 ↓
Flap
 ↓
Flap Down
 ↓
Idle
```

Animation timing should ideally be independent of frame rate so gameplay
remains consistent on different devices.

---

# 🌍 World & Environment

The game world is made from reusable layers:

```text
Sky
 ├── Clouds
 ├── City
 ├── Decorative Elements
 └── Gameplay Layer
       ├── Bird
       └── Pipes

Ground
 └── Scrolling Grass / Soil
```

Background elements can move at different speeds to create a lightweight
parallax effect.

---

# 🔊 Audio

Suggested sound effects include:

- `flap`
- `score`
- `collision`
- `game-over`
- `button-click`
- `restart`
- `mode-select`
- `achievement`

Audio should remain lightweight and should never interfere with
gameplay.

Modern mobile browsers may require a user interaction before audio
playback is allowed.

---

# 📤 Share Score

The Share button allows players to share their result.

Example:

```text
🐦 I scored 42 in DoodleBird!

Can you beat my score?
```

Where supported, the game can use the browser's native Web Share API.

If native sharing is unavailable, the game can provide a clipboard
fallback.

---

# 🧱 Technology Stack

DoodleBird is designed as a lightweight web application.

## Frontend

### HTML5

Used for:

- Page structure
- Game container
- UI
- Menus
- Accessibility markup

### CSS3

Used for:

- Responsive layouts
- UI styling
- Buttons
- Menus
- Animations
- Mobile presentation

### JavaScript / ECMAScript

Used for:

- Game loop
- Physics
- Collision detection
- Sprite animation
- Pipe spawning
- Score calculation
- Game states
- Input handling
- Audio
- Local storage
- Sharing
- Leaderboard communication

## Rendering

For a 2D browser game, the **HTML5 Canvas API** is a good fit for the
main game scene.

If the project uses **Three.js**, Three.js can handle the rendering
layer while JavaScript manages gameplay logic.

## Browser APIs

Potential browser APIs include:

- Canvas API
- Web Audio API
- `localStorage`
- `requestAnimationFrame`
- Web Share API
- Clipboard API
- Pointer Events
- Touch Events
- Keyboard Events

## Backend / Leaderboard

An online leaderboard can use a small backend API and database:

```text
Browser
   ↓
DoodleBird Game
   ↓
Leaderboard API
   ↓
Database
```

The backend provider can be changed without changing the core game.

---

# 🔐 Privacy

DoodleBird should avoid collecting unnecessary personal information.

If an online leaderboard is implemented, document exactly what is
stored, such as:

- Display name
- Score
- Game mode
- Submission time

If analytics, advertising, cookies, or third-party services are added,
update the project's privacy documentation accordingly.

---

# 🧪 Testing Checklist

## Gameplay

- [ ] Bird flap works
- [ ] Gravity feels consistent
- [ ] Pipes spawn correctly
- [ ] Pipe gaps are playable
- [ ] Collision works
- [ ] Score increments correctly
- [ ] Game over works
- [ ] Restart works
- [ ] Best score is saved

## Mobile

- [ ] Touch input works
- [ ] Portrait layout works
- [ ] Buttons are easy to tap
- [ ] Page does not accidentally scroll
- [ ] Audio works correctly

## Desktop

- [ ] Keyboard input works
- [ ] Mouse input works
- [ ] Game scales correctly
- [ ] Fullscreen works if supported

## Leaderboard

- [ ] Valid scores are accepted
- [ ] Invalid submissions are rejected
- [ ] Player names are handled safely
- [ ] Duplicate submissions are handled
- [ ] Network errors do not break gameplay

---

# 🐛 Troubleshooting

## The game feels laggy

Try:

1. Closing unnecessary browser tabs.
2. Testing the production build.
3. Compressing large image files.
4. Checking for unnecessary DOM updates.
5. Reusing game objects.
6. Testing another browser or device.

## Sound does not play

Modern browsers can block autoplay audio. Interact with the page first
and then start the game.

Also check the game's sound settings and browser permissions.

## Leaderboard is not updating

Check:

- Internet connection
- API availability
- Backend configuration
- Browser console errors
- Server validation errors
- Environment variables

Never expose private server credentials in frontend JavaScript.

---

# 🤝 Contributing

Contributions are welcome! Here are some good contribution ideas:

- New game modes
- Better mobile controls
- Performance improvements
- Accessibility improvements
- New doodle animations
- New sound effects
- UI improvements
- Better leaderboard validation
- Bug fixes
- Documentation improvements

Please keep new features consistent with DoodleBird's simple arcade
identity.

---

# 📋 Roadmap

Potential future improvements:

- [ ] More challenge modes
- [ ] Daily challenge
- [ ] Global leaderboard
- [ ] Friends leaderboard
- [ ] Achievements
- [ ] Unlockable bird designs
- [ ] More backgrounds
- [ ] More obstacle types
- [ ] Better mobile optimization
- [ ] Offline/PWA support
- [ ] Improved audio system
- [ ] Replay and score sharing
- [ ] Accessibility improvements
- [ ] Performance profiling on low-end devices

The roadmap may change as development continues.

---

# ⚖️ Copyright & Fan Project Disclaimer

DoodleBird is an **independent, fan-inspired browser game project**.

It is inspired by the gameplay concept of the original Flappy Bird, but
DoodleBird is not intended to represent, replace, or impersonate the
original game or its creators.

DoodleBird is **not affiliated with, endorsed by, sponsored by, or
officially connected to the creators or rights holders of Flappy Bird**.

DoodleBird uses its own project branding, artwork, interface, code, and
game assets.

Third-party names, trademarks, libraries, services, fonts, sounds,
images, and other external components remain the property of their
respective owners and may have separate licenses.

---

# 📜 License

DoodleBird's original source code is released under the **MIT License**,
unless a specific file or third-party component states otherwise.

See [`LICENSE`](LICENSE) for the complete license text.

Third-party libraries, fonts, sounds, images, APIs, and other external
components may have separate license and attribution requirements.

---

# 📩 Support

If something is not working properly, the game feels laggy, you discover
a bug, or you have a suggestion, please contact us.

When reporting an issue, include:

- Device
- Browser
- Operating system
- Game mode
- Approximate score
- What happened
- Steps to reproduce the issue
- Screenshot or screen recording if possible

This information helps us reproduce and fix problems faster.

You can also reach out directly:

- GitHub: [@ketanofc](https://github.com/ketanofc)
- Twitter / X: [@ketanofc](https://twitter.com/ketanofc)

---

# 💬 Feedback

DoodleBird is an ongoing project, and player feedback helps improve it.

If you enjoy the game, find a bug, have an idea for a new mode, or want
to suggest an improvement, open an issue or contact the project team.

Please keep feedback constructive and respectful.

---

# ❤️ Final Note

DoodleBird is built around a simple idea:

> **Easy to play. Hard to master. Fun to replay.**

The project keeps the classic endless-flyer formula intentionally simple
while giving it a unique doodle-inspired visual identity and additional
features.

Have fun, play fair, and try to beat the high score. 🐦

---

## ⭐ If You Like DoodleBird

If you enjoy the project, consider giving the repository a ⭐ and
sharing the game with your friends.

**Can you beat the high score?**

---

<p align="center">
Made with ❤️ by <a href="https://github.com/ketanofc">@ketanofc</a>
</p>
