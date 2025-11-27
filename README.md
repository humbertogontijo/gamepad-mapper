# 🎮 Gamepad Mapping

A powerful desktop application that maps your gamepad/controller inputs to keyboard keys and mouse movements. Perfect for gaming, productivity, or accessibility needs.

![GitHub stars](https://img.shields.io/github/stars/humbertogontijo/gamepad-mapper?style=social)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

## ✨ Features

- **🎯 Button Mapping**: Map any gamepad button to keyboard keys
- **🕹️ Analog Stick Control**: Two powerful modes for analog sticks:
  - **Hotkey Mode**: Map stick directions (8 directions) to keyboard keys with customizable thresholds
  - **Mouse Mode**: Control your mouse cursor with configurable sensitivity, acceleration, and axis inversion
- **⬆️ D-Pad Mapping**: Map D-pad directions to keyboard keys
- **👁️ Visual Controller Interface**: Real-time visualization of your gamepad state with interactive controls
- **🔌 Multi-Device Support**: Connect and configure multiple gamepads simultaneously
- **💾 Persistent Mappings**: Your configurations are automatically saved and restored
- **🔄 Auto-Updates**: Built-in update system keeps you on the latest version
- **🎨 Modern UI**: Clean, intuitive interface built with React and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js >= 14.18.0 || >= 16.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/humbertogontijo/gamepad-mapper.git

# Navigate to the project directory
cd gamepad-watcher

# Install dependencies
npm install
# or
yarn install

# Run in development mode
npm run dev
# or
yarn dev
```

### Building

```bash
# Build for production
npm run build
# or
yarn build
```

The built application will be available in the `release/` directory.

## 📖 Usage

1. **Connect Your Gamepad**: Plug in your gamepad/controller and press any button to activate it
2. **Select a Control**: Click on any button, stick, or D-pad direction in the visual controller
3. **Map to Keyboard**: Choose a keyboard key to map the selected control to
4. **Configure Sticks**: For analog sticks, choose between Hotkey mode (8-direction keyboard mapping) or Mouse mode (cursor control)
5. **Save Automatically**: All mappings are saved automatically and will persist between sessions

### Mouse Mode Features

When using Mouse Mode for analog sticks, you can configure:
- **Sensitivity**: Control how fast the cursor moves (0.1 - 10.0)
- **Acceleration**: Add acceleration for smoother movement (0.0 - 2.0)
- **Axis Inversion**: Invert X or Y axis if needed

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 33
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Input Simulation**: @nut-tree-fork/nut-js
- **Auto-Updates**: electron-updater

## 📁 Project Structure

```
├── electron/              # Electron main process and preload scripts
│   ├── main/             # Main process code
│   └── preload/          # Preload scripts
├── src/                   # React application source
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── release/              # Built application executables
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ☕ Support

If you find this project useful, consider buying me a coffee to support development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/humbertogontijo)

## 🙏 Acknowledgments

Built with [electron-vite-react](https://github.com/electron-vite/electron-vite-react) template.

---

Made with ❤️ by [Humberto Gontijo](https://github.com/humbertogontijo)
