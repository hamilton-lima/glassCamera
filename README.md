# glassCamera
Ionic application to filter images

# Code to explore 

- Where the image processing happens : https://github.com/hamilton-lima/glassCamera/blob/master/src/pages/home/imageprocessor.ts
- Camera access from Ionic project, look for cordova-plugin-ios-camera-permissions: https://github.com/hamilton-lima/glassCamera/blob/master/config.xml
- Main page behaviour - https://github.com/hamilton-lima/glassCamera/blob/master/src/pages/home/home.ts

# How to run 

Use the command:
```
ionic cordova run ios --livereload --consolelogs --debug
```

# Results

There are no optimizations in the current image processing, only distance between colors are calculated.

Original
(images/original.jpg)

Red filter
(images/mask_red.png)

Blue filter 
(images/mask_blue.png)
