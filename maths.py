#!/bin/env/python2
# LeapPython API only supported in Python 2.7
import leap_setup
import Leap
from Leap import CircleGesture, KeyTapGesture, ScreenTapGesture, SwipeGesture
print("Leap module successfully imported")

import os, sys, inspect, thread, time
import math, serial

# Find the port the Arduino is connected on
ARDUINO_PORT = None
for port in list(serial.tools.list_ports.comports()):
    if "Arduino" in port[1]:
        ARDUINO_PORT = port[0]
        break
if ARDUINO_PORT is None:
    raise IOException("Did not find an Arduino port, is it plugged in?")

#ARDUINO_PORT = "COM11" # The port where the Arduino is connected, verify before running
BAUDRATE = 9600 # Similar to Hz, how many symbols transmitted to Arduino per second

ser = serial.Serial(ARDUINO_PORT, BAUDRATE)

class SampleListener(Leap.Listener):
    
    def on_init(self, controller):
        print("Initialized")

    def on_connect(self, controller):
        """
        Enables the Circle, Key Tap, Screen Tap, and Swipe gestures
        """
        print("Leap Connected")

        # Enable gestures
        controller.enable_gesture(Leap.Gesture.TYPE_CIRCLE);
        controller.enable_gesture(Leap.Gesture.TYPE_KEY_TAP);
        controller.enable_gesture(Leap.Gesture.TYPE_SCREEN_TAP);
        controller.enable_gesture(Leap.Gesture.TYPE_SWIPE);

    def on_disconnect(self, controller):
        # Note: Not dispatched when running in a debugger.
        print("Leap Disconnected")
        ser.write("0")

    def on_exit(self, controller):
        """
        Should write 0 to the Arduino and close the serial port
        """
        
        ser.write("0")
        ser.close()
        print("Exited")

    def on_frame(self, controller):
        """
        Called every time the Leap registers a new frame. Where most of the
        heavy-lifting for determining whether to send a signal to the Arduino
        should happen.
        """

        frame = controller.frame()

        pin_voltage = 0 

        # Check if the hand has any fingers
        fingers = frame.pointables
        if fingers.is_empty:
            pin_voltage = 0
        else:
            print("Hand detected")
            finger = fingers.frontmost
            position = finger.tip_position
            # Code for maths
            #x = position.x / 50
            #y = (position.y - 50) / 50
            #f = math.pow(2,x)
            #if y >= -1.2 + f and y<= 1.2 + f:

            # For now, send "1" to Arduino is fingers detected over Leap
            pin_voltage = 1
            print("Detected finger at ({}, {}, {})".format(
                    position.x, position.y, position.z))
        ser.write(str(pin_voltage))
        
    def state_string(self, state):
        if state == Leap.Gesture.STATE_START:
            return "STATE_START"

        if state == Leap.Gesture.STATE_UPDATE:
            return "STATE_UPDATE"

        if state == Leap.Gesture.STATE_STOP:
            return "STATE_STOP"

        if state == Leap.Gesture.STATE_INVALID:
            return "STATE_INVALID"

def main():
    # Create a sample listener and controller
    listener = SampleListener()
    controller = Leap.Controller()
    controller.set_policy_flags(Leap.Controller.POLICY_BACKGROUND_FRAMES)

    # Have the sample listener receive events from the controller
    controller.add_listener(listener)
    # Keep the process running until Enter is pressed
    time.sleep(1) # One second
    print("Press Ctrl-C to quit...")
    try:
        #sys.stdin.readline()
        while True:
            time.sleep(2) 
    except KeyboardInterrupt:
        pass
    finally:
        # Remove the sample listener when doen
        controller.remove_listener(listener) 

if __name__ == "__main__":
    main()

