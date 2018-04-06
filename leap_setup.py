import sys
if sys.platform == "darwin":
    sys.path.insert(0, "./lib/OSX")
elif 'linux' in sys.platform:
    sys.path.insert(0, "./lib/Linux")
else:
    sys.path.insert(0, "./lib/Windows")
import Leap
from Leap import CircleGesture, KeyTapGesture, ScreenTapGesture, SwipeGesture
