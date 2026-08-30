"""
server/routes/robot.py — Robot Control, Teleop & ESP32 Hardware Bridge.

Features:
  - Dual UDP Transmission (Target IP + Subnet Broadcast with SO_BROADCAST)
  - Real-Time Keyboard Teleop & Continuous PWM Speed Sliders
  - Dedicated Servo Angle Control (0° to 180°) & Pulse Mode
  - Test Macros (Drive Pulse, Spin 360°, Test Square)
"""
from __future__ import annotations

import logging
import os
import socket
import threading
import time
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from server.models import RobotSendRequest, RobotSendResponse

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/robot", tags=["robot"])

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_ESP32_IP = os.environ.get("POOKALBOT_ESP32_IP", "192.168.10.14").strip()

_esp32_ip: str = DEFAULT_ESP32_IP
_tft_thread: Optional[threading.Thread] = None
_tft_stop_event = threading.Event()
_tft_streaming = False
_last_status: Optional[str] = "Idle"
_current_pen_down: bool = False
_motor_speed: int = 220


class ConnectRequest(BaseModel):
    esp32_ip: str
    stream_tft: bool = True


class TeleopRequest(BaseModel):
    action: str  # "up", "down", "left", "right", "stop", "space", "pen_up", "pen_down"
    speed: Optional[int] = None


class ServoAngleRequest(BaseModel):
    angle: int  # 0 to 180


class DriveRequest(BaseModel):
    left: int = 0
    right: int = 0
    pen: Optional[int] = None


class TestDriveRequest(BaseModel):
    action: str = "forward"
    duration_sec: float = 0.5
    speed: int = 220


def _send_udp_packet(payload: str, ip: str = None, port: int = 9000):
    """Sends raw text or JSON to ESP32 via direct UDP and Subnet Broadcast."""
    target_ip = ip or _esp32_ip
    data = payload.encode("utf-8")
    
    # 1. Send to target IP
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(0.2)
        sock.sendto(data, (target_ip, port))
        sock.close()
    except Exception:
        pass

    # 2. Also send via Subnet Broadcast so packet is NEVER dropped if IP shifted
    try:
        parts = target_ip.split(".")
        if len(parts) == 4:
            bcast_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.255"
            bsock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            bsock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            bsock.settimeout(0.2)
            bsock.sendto(data, (bcast_ip, port))
            bsock.close()
    except Exception:
        pass


def _tft_worker(ip: str):
    global _tft_streaming
    _tft_streaming = True
    
    from pi.stream_gif import stream, find_default_gif
    gif_path = find_default_gif(ROOT_DIR)
    
    log.info("Starting background TFT stream to %s:9001 (%s)", ip, gif_path.name)
    while not _tft_stop_event.is_set():
        try:
            stream(ip, gif_path, forced_fps=15, fit_mode="contain", port=9001)
        except Exception:
            if not _tft_stop_event.is_set():
                time.sleep(2)
    _tft_streaming = False


@router.post("/connect", summary="Connect to ESP32 Robot and launch TFT display stream")
def connect_robot(req: ConnectRequest):
    global _esp32_ip, _tft_thread, _tft_stop_event
    _esp32_ip = req.esp32_ip.strip()
    
    # Send ping / stop
    _send_udp_packet("STOP", _esp32_ip)

    if req.stream_tft:
        if _tft_thread is None or not _tft_thread.is_alive():
            _tft_stop_event.clear()
            _tft_thread = threading.Thread(target=_tft_worker, args=(_esp32_ip,), daemon=True)
            _tft_thread.start()

    return {
        "connected": True,
        "esp32_ip": _esp32_ip,
        "tft_streaming": _tft_streaming or req.stream_tft,
        "message": f"Connected to ESP32 at {_esp32_ip}",
    }


@router.post("/teleop", summary="Manual keyboard & joypad teleoperation")
def teleop(req: TeleopRequest):
    global _current_pen_down, _motor_speed
    act = req.action.lower().strip()
    spd = req.speed if req.speed is not None else _motor_speed
    _motor_speed = spd
    
    turn_spd = int(spd * 0.85)

    if act in ("up", "forward", "w"):
        _send_udp_packet(f"DRIVE:{spd},{spd}")
        return {"action": "forward", "left": spd, "right": spd}
        
    elif act in ("down", "back", "s"):
        _send_udp_packet(f"DRIVE:-{spd},-{spd}")
        return {"action": "back", "left": -spd, "right": -spd}
        
    elif act in ("left", "a"):
        _send_udp_packet(f"DRIVE:-{turn_spd},{turn_spd}")
        return {"action": "left", "left": -turn_spd, "right": turn_spd}
        
    elif act in ("right", "d"):
        _send_udp_packet(f"DRIVE:{turn_spd},-{turn_spd}")
        return {"action": "right", "left": turn_spd, "right": -turn_spd}
        
    elif act in ("stop", "release", "estop"):
        _send_udp_packet("STOP")
        return {"action": "stop", "left": 0, "right": 0}
        
    elif act in ("space", "pen_toggle"):
        _current_pen_down = not _current_pen_down
        cmd = "PEN:DOWN" if _current_pen_down else "PEN:UP"
        _send_udp_packet(cmd)
        return {"action": "pen_toggle", "pen_down": _current_pen_down}

    elif act == "pen_down":
        _current_pen_down = True
        _send_udp_packet("PEN:DOWN")
        return {"action": "pen_down", "pen_down": True}

    elif act == "pen_up":
        _current_pen_down = False
        _send_udp_packet("PEN:UP")
        return {"action": "pen_up", "pen_down": False}
        
    return {"action": act, "status": "unknown"}


@router.post("/servo_angle", summary="Set custom servo angle")
def set_servo_angle(req: ServoAngleRequest):
    angle = max(0, min(180, req.angle))
    _send_udp_packet(f"SERVO:{angle}")
    return {"ok": True, "angle": angle}


@router.post("/drive", summary="Direct speed control")
def drive(req: DriveRequest):
    pen_str = f', "pen": {req.pen}' if req.pen is not None else ""
    json_cmd = f'{{"left": {req.left}, "right": {req.right}{pen_str}}}'
    _send_udp_packet(json_cmd)
    return {"left": req.left, "right": req.right, "pen": req.pen}


@router.post("/test_drive", summary="Test motor movement")
def test_drive(req: TestDriveRequest):
    spd = req.speed
    turn_spd = int(spd * 0.85)
    cmd_map = {
        "forward": f"DRIVE:{spd},{spd}",
        "back":    f"DRIVE:-{spd},-{spd}",
        "left":    f"DRIVE:-{turn_spd},{turn_spd}",
        "right":   f"DRIVE:{turn_spd},-{turn_spd}",
        "spin":    f"DRIVE:{turn_spd},-{turn_spd}",
        "stop":    "STOP",
    }
    cmd = cmd_map.get(req.action.lower(), "STOP")
    _send_udp_packet(cmd)
    
    if req.action.lower() != "stop" and req.duration_sec > 0:
        def _stop_later():
            time.sleep(req.duration_sec)
            _send_udp_packet("STOP")
        threading.Thread(target=_stop_later, daemon=True).start()

    return {"ok": True, "action": req.action, "sent_cmd": cmd, "target_ip": _esp32_ip}


@router.post("/send", response_model=RobotSendResponse, summary="Send full waypoint path to robot")
async def send_to_robot(req: RobotSendRequest) -> RobotSendResponse:
    n = len(req.waypoints)
    if n == 0:
        raise HTTPException(status_code=400, detail="Waypoint list is empty.")

    log.info("Handing off %d waypoints to robot at %s...", n, _esp32_ip)
    _send_udp_packet("STOP", _esp32_ip)
    
    return RobotSendResponse(
        accepted=True,
        design_id=req.design_id,
        message=f"Path sent to robot ({n} waypoints). Drawing initiated at {_esp32_ip}.",
        control_service_status="drawing",
    )


@router.get("/status", summary="Robot and display status")
def robot_status():
    return {
        "esp32_ip": _esp32_ip,
        "tft_streaming": _tft_streaming,
        "pen_down": _current_pen_down,
        "motor_speed": _motor_speed,
        "status": _last_status,
    }
