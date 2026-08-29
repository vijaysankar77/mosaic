#include <Arduino.h>
#include "protocol.h"

// ── Global state ──────────────────────────────────────────────────────────────

static StatusUpdate gStatus;
static bool         gEstopped      = false;
static unsigned long gLastStatusMs = 0;
static const unsigned long STATUS_INTERVAL_MS = 200;

// ── Stub handlers (real motor/servo logic goes here later) ────────────────────

void drive(int left, int right, int duration_ms) {
    // TODO: set left/right motor PWM via motor driver
    // TODO: schedule stop after duration_ms using a timer or millis() check
    snprintf(gStatus.phase, sizeof(gStatus.phase), "driving");
}

void turretMove(float theta, float r) {
    // TODO: command turret stepper/servo to polar position (theta, r)
    gStatus.turret_theta = theta;
    gStatus.turret_r     = r;
    snprintf(gStatus.phase, sizeof(gStatus.phase), "drawing");
}

void turretHome() {
    // TODO: run turret homing sequence (limit switches or encoder reset)
    gStatus.turret_theta = 0.0f;
    gStatus.turret_r     = 0.0f;
    snprintf(gStatus.phase, sizeof(gStatus.phase), "homing");
}

void setPen(PenState state) {
    // TODO: actuate pen servo — up lifts chalk off surface, down presses it
    snprintf(gStatus.phase, sizeof(gStatus.phase),
             state == PenState::DOWN ? "pen_down" : "pen_up");
}

void cleanStart(CleanMode mode) {
    // TODO: start the appropriate cleaning routine based on mode
    // PRE           -> dry brush pass before drawing
    // POST_NO_EXCLUDE -> dry brush full area after drawing
    // WET           -> wet mop sequence
    snprintf(gStatus.phase, sizeof(gStatus.phase), "cleaning");
}

// ── E-stop: halt everything immediately ──────────────────────────────────────

void executeEstop() {
    // TODO: write 0 to all motor PWM outputs immediately
    // TODO: disable any active timers driving motors
    gEstopped = true;
    snprintf(gStatus.phase, sizeof(gStatus.phase), "estopped");
    gStatus.ok = false;
}

// ── Command dispatch ──────────────────────────────────────────────────────────

void dispatchCommand(const Command& cmd) {
    switch (cmd.type) {
        case CmdType::DRIVE:
            if (!gEstopped) drive(cmd.drive.left, cmd.drive.right, cmd.drive.duration_ms);
            break;
        case CmdType::TURRET_MOVE:
            if (!gEstopped) turretMove(cmd.turret.theta, cmd.turret.r);
            break;
        case CmdType::TURRET_HOME:
            if (!gEstopped) turretHome();
            break;
        case CmdType::PEN:
            if (!gEstopped) setPen(cmd.pen.state);
            break;
        case CmdType::CLEAN_START:
            if (!gEstopped) cleanStart(cmd.clean.mode);
            break;
        case CmdType::ESTOP:
            executeEstop();  // already handled above, but safe to call again
            break;
        default:
            break;
    }
}

// ── Arduino entry points ──────────────────────────────────────────────────────

void setup() {
    Serial.begin(115200);
    snprintf(gStatus.phase, sizeof(gStatus.phase), "idle");
}

void loop() {
    // Read a full line from serial if available
    if (Serial.available()) {
        String line = Serial.readStringUntil('\n');
        line.trim();

        if (line.length() > 0) {
            // ── ESTOP CHECK FIRST — before any JSON parsing ──────────────────
            // strstr scan on raw bytes so this fires even if JSON is malformed
            // or the parser is slow. This is the lowest-level safety net.
            if (strstr(line.c_str(), "\"estop\"") != nullptr) {
                executeEstop();
            } else if (!gEstopped) {
                // Normal command parsing only when not estopped
                Command cmd;
                if (parseCommand(line.c_str(), cmd)) {
                    dispatchCommand(cmd);
                }
                // Malformed JSON: silently ignore and continue
            }
        }
    }

    // Send status every ~200 ms
    unsigned long now = millis();
    if (now - gLastStatusMs >= STATUS_INTERVAL_MS) {
        gLastStatusMs = now;
        // TODO: populate gStatus.battery_mv from ADC read
        // TODO: populate gStatus.obstacle from proximity sensor
        sendStatus(gStatus); 
    }
}
b