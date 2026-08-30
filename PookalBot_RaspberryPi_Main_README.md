# PookalBot --- Raspberry Pi Main Controller

## Purpose

PookalBot is being designed with the **Raspberry Pi as the main brain**
of the robot.

The complete project repository will live on the Raspberry Pi. The Pi
will handle the application's data, AI/ML, computer vision, Pookalam
patterns, planning, and high-level robot logic.

The **ESP32 will remain a dedicated hardware controller** for motors,
servo, TFT, sensors, and GPIO.

``` text
                    PookalBot Repository
                           │
                           ▼
                  ┌──────────────────┐
                  │   Raspberry Pi   │
                  │   MAIN BRAIN 🧠  │
                  │                  │
                  │ AI / ML           │
                  │ Computer Vision   │
                  │ Pookalam Data     │
                  │ Pattern Storage   │
                  │ Path Planning     │
                  │ App / Backend     │
                  │ Configuration     │
                  │ Logs              │
                  └────────┬─────────┘
                           │
                     USB Serial / Wi-Fi
                           │
                           ▼
                  ┌──────────────────┐
                  │      ESP32       │
                  │ HARDWARE CONTROL │
                  │                  │
                  │ Motors           │
                  │ 360° Servo       │
                  │ TFT Display      │
                  │ Sensors          │
                  │ GPIO             │
                  └──────────────────┘
```

------------------------------------------------------------------------

# 1. Repository on Raspberry Pi

The repository should be cloned directly onto the Raspberry Pi.

## Install Git

``` bash
sudo apt update
sudo apt install git -y
```

Check:

``` bash
git --version
```

## Clone the repository

Go to the home directory:

``` bash
cd ~
```

Clone the GitHub repository:

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Example:

``` bash
git clone https://github.com/USERNAME/PookalBot.git
```

Enter the project:

``` bash
cd PookalBot
```

Check the files:

``` bash
ls
```

The Raspberry Pi now contains the complete repository.

------------------------------------------------------------------------

# 2. Keeping the Raspberry Pi Updated

Whenever changes are pushed to GitHub:

``` bash
cd ~/PookalBot
git pull
```

This downloads the latest version of the project.

To send changes from the Raspberry Pi back to GitHub:

``` bash
git add .
git commit -m "Update PookalBot"
git push
```

Do not store passwords or API keys directly in the repository.

------------------------------------------------------------------------

# 3. Recommended Project Structure

The repository should eventually follow a structure similar to:

``` text
PookalBot/
│
├── README.md
│
├── raspberry_pi/
│   ├── main.py
│   ├── esp32.py
│   ├── vision/
│   ├── ai/
│   ├── planner/
│   └── config/
│
├── esp32/
│   └── pookalbot.ino
│
├── app/
│
├── data/
│   └── patterns/
│
├── models/
│
├── cad/
│
├── tests/
│
├── requirements.txt
│
└── .gitignore
```

The exact folders can be changed to match the existing repository.

------------------------------------------------------------------------

# 4. Raspberry Pi Responsibilities

The Raspberry Pi should contain and run the project's high-level
software.

### AI / ML

-   Pattern generation
-   Pattern recognition
-   Intelligent decision making
-   Future ML models

### Computer Vision

-   Camera processing
-   Ground/work-area detection
-   Robot positioning
-   Object detection
-   Alignment

### Pookalam Data

-   Pookalam patterns
-   Generated designs
-   Pattern parameters
-   Saved configurations

### Path Planning

The Pi converts a Pookalam design into a sequence of robot movements.

``` text
Pookalam Pattern
       ↓
Pattern Processing
       ↓
Path Planning
       ↓
Movement Commands
       ↓
ESP32
       ↓
Motors / Servo
```

### Application

The Raspberry Pi can host the robot's:

-   Web application
-   API
-   Dashboard
-   Control interface
-   Configuration
-   Status monitoring

------------------------------------------------------------------------

# 5. ESP32 Responsibilities

The ESP32 should **not contain the main project data or AI logic**.

It should receive commands from the Raspberry Pi and execute them.

``` text
Raspberry Pi
     │
     │ command
     ▼
   ESP32
     │
     ├── Motors
     ├── Servo
     ├── TFT
     └── Sensors
```

Examples:

``` text
MOVE:FWD:100
MOVE:LEFT:80
MOVE:RIGHT:80
SERVO:90
SERVO:120
STOP
DISPLAY:READY
```

------------------------------------------------------------------------

# 6. Connecting the Raspberry Pi to ESP32

## Recommended First Method: USB

Connect the ESP32 to the Raspberry Pi using a USB cable.

``` text
Raspberry Pi
     │
     │ USB
     ▼
   ESP32
```

After connecting, check for the serial device:

``` bash
ls /dev/ttyUSB*
```

If that returns nothing, try:

``` bash
ls /dev/ttyACM*
```

Typical result:

``` text
/dev/ttyUSB0
```

or:

``` text
/dev/ttyACM0
```

That port will be used by the Raspberry Pi software to communicate with
the ESP32.

------------------------------------------------------------------------

# 7. Raspberry Pi Serial Communication

Install the Python serial library:

``` bash
pip install pyserial
```

A basic connection can use:

``` python
import serial

esp32 = serial.Serial(
    "/dev/ttyUSB0",
    115200,
    timeout=1
)

esp32.write(b"SERVO:90\n")
```

If the device appears as `/dev/ttyACM0`, replace the port accordingly.

The final communication layer should be isolated in something like:

``` text
raspberry_pi/esp32.py
```

This allows the rest of the application to communicate with the robot
without directly handling serial-port details.

------------------------------------------------------------------------

# 8. Wi-Fi Communication

USB serial is recommended for the **first working prototype**.

Later, the system can use Wi-Fi:

``` text
Raspberry Pi
      │
      │ Wi-Fi
      ▼
    ESP32
```

Both devices can connect to the same local network.

Wi-Fi can be useful when:

-   The ESP32 is physically separated from the Pi
-   Wireless robot control is required
-   The application already uses a network API
-   Multiple devices need to communicate

------------------------------------------------------------------------

# 9. ESP32 Hardware Pin Configuration

### TFT

  TFT          ESP32
  ------------ ---------
  LED          3.3V
  SCK          GPIO 18
  SDA / MOSI   GPIO 23
  A0 / DC      GPIO 2
  RESET        GPIO 4
  CS           GPIO 5
  GND          GND
  VCC          3.3V

### 360° Continuous Servo

  Servo    Connection
  -------- -------------
  Signal   GPIO 19
  VCC      External 5V
  GND      Common GND

Servo commands:

``` text
90      → approximately STOP
< 90    → direction 1
> 90    → direction 2
```

The exact stop value may require calibration.

**Never power the servo from the ESP32 3.3V pin.**

The external servo supply ground must be connected to the ESP32 ground.

------------------------------------------------------------------------

# 10. Development Workflow

The intended workflow is:

``` text
Developer
   │
   ▼
GitHub Repository
   │
   │ git pull
   ▼
Raspberry Pi
   │
   ├── Run application
   ├── Run AI/ML
   ├── Process camera
   ├── Load Pookalam data
   └── Generate commands
           │
           ▼
         ESP32
           │
           ├── Motors
           ├── Servo
           ├── TFT
           └── Sensors
```

The Raspberry Pi should therefore be treated as the **primary
development and runtime environment** for the robot.

------------------------------------------------------------------------

# 11. Important Rule for the Repository

### Store on Raspberry Pi / Repository

-   Application code
-   AI/ML models
-   Pookalam patterns
-   Configuration
-   Computer vision code
-   Path-planning code
-   Database/data
-   Logs and test results
-   ESP32 firmware source

### Keep on ESP32

-   Compiled firmware
-   Real-time hardware control
-   GPIO operations
-   Motor control
-   Servo control
-   TFT control
-   Sensor reading

The ESP32 does not need a copy of the complete project repository.

------------------------------------------------------------------------

# 12. API Keys and Secrets

Never commit API keys into GitHub.

Use environment variables or a local `.env` file.

Example:

``` text
.env
```

Add it to `.gitignore`:

``` text
.env
```

Example:

``` text
GEMINI_API_KEY=your_key_here
```

The actual key should only exist on the Raspberry Pi's local
environment.

------------------------------------------------------------------------

# 13. Goal

The final system should work like this:

``` text
                    USER
                     │
                     ▼
              Raspberry Pi
             ┌──────────────┐
             │ Application  │
             │ AI / ML      │
             │ Vision       │
             │ Data         │
             │ Planning     │
             └──────┬───────┘
                    │
              Robot Commands
                    │
                    ▼
                  ESP32
             ┌──────┼───────┐
             ▼      ▼       ▼
           Motors Servo    TFT
```

**Raspberry Pi = Brain 🧠**

**ESP32 = Hardware Controller ⚙️**

This architecture allows the project to keep all important data and
intelligence on the Raspberry Pi while using the ESP32 for reliable
real-time hardware control.
