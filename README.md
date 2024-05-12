# ComfyWearFrontEnd

## Technology Stack
- React 17
- Node.js v21.7.1 or newer
- MQTT.js for real-time data handling
- MUI (Material UI) v5 for UI components

## Installation
Follow these steps to set up the frontend environment for ComfyWear:

1. **Clone the Repository**
   - Open your terminal.
   - Clone the frontend repository using Git:
     ```
     git clone https://github.com/ComfyWear/ComfyWearFrontEnd.git
     ```
   - Navigate into the cloned directory:
     ```
     cd ComfyWearFrontEnd
     ```

2. **Install Dependencies**
   - Ensure Node.js (v21.7.1 or newer) is installed on your system.
   - Install all required npm packages:
     ```
     npm install
     ```

3. **Environment Setup**
   - Configure environment variables needed by the frontend in a `.env` file. Ensure to define necessary variables like API endpoints and any other sensitive data securely.

## Running the Application
- Run the `comfyboard.py` in your microcontroller board.
- Start the React application by running:
    ```
    npm start
    ```
- This command will compile the React app and start the development server. By default, it will run on [http://localhost:3000](http://localhost:3000).
