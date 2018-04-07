#!/bin/env/python2
# LeapPython API only supported in Python 2.7
import leap_setup
import Leap
from Leap import CircleGesture, KeyTapGesture, ScreenTapGesture, SwipeGesture
print("Leap module successfully imported")

import os, sys, inspect, thread, time
import math #serial, math

class SampleListener(Leap.Listener):
    
    def on_init(self, controller):
        print("Initialized")

    def on_connect(self, controller):
        """
        Enables the Circle, Key Tap, Screen Tap, and Swipe gestures
        """
        print("Connected")

        # Enable gestures
        controller.enable_gesture(Leap.Gesture.TYPE_CIRCLE);
        controller.enable_gesture(Leap.Gesture.TYPE_KEY_TAP);
        controller.enable_gesture(Leap.Gesture.TYPE_SCREEN_TAP);
        controller.enable_gesture(Leap.Gesture.TYPE_SWIPE);

    def on_disconnect(self, controller):
        # Note: Not dispatched when running in a debugger.
        print("Disconnected")

    def on_exit(self, controller):
        """
        Should write 0 to the Arduino and close the serial port
        """
        pass
        # ser.write("0")
        # ser.close()
        print("Exited")

    def on_frame(self, controller):
        """
        """
        # Get the most recent frame and report some basic information
        # print("Got a frame")
        frame = controller.frame()
        a = 0 # TODO: What is this?
        # Check if the hand has any fingers
        fingers = frame.pointables
        if fingers.is_empty:
            a = 0
        else:
            print("Hand detected")
            finger = fingers.frontmost
            position = finger.tip_position
            # Code for maths
            x = position.x / 50
            y = (position.y - 50) / 50
            f = math.pow(2,x)
            if y >= -1.2 + f and y<= 1.2 + f:
                a = 1
                print("Detected finger at ({}, {})".format(x,y))
    
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
    time.sleep(1)
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

