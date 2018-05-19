import { ImageMaskColor, ImageProcessor } from './imageprocessor';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  colors = [
    new ImageMaskColor('#C2585B'),
    new ImageMaskColor('#59A392'),
    new ImageMaskColor('#5C759A'),
    new ImageMaskColor('#E7D97F'),
    new ImageMaskColor('#D87092'),
    new ImageMaskColor('#44985F'),
    new ImageMaskColor('#3786B3')
  ];

  current = this.colors[0];
  base64Image = 'assets/imgs/placeholder.png';
  lastPictureTime = new Date().toString();
  threshold = 50;
  processor: ImageProcessor;

  readonly defaultFilenamePrefix = 'glassCamera_original_';

  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    private base64ToGallery: Base64ToGallery,
    private toast: ToastController
  ) {}

  onColorChange(color) {
    console.log('onColorChange', color);
    this.current = color;
    if (this.processor) {
      this.updateImage();
    }
  }

  readonly options: CameraOptions = {
    targetWidth: 1600,
    targetHeight: 1200,
    quality: 95,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    saveToPhotoAlbum: false,
    allowEdit: false
  };

  takePicture() {
    console.log('Took picture');

    try {
      this.camera
        .getPicture(this.options)
        .then(
          imageData => {
            console.log('Received image data');
            this.lastPictureTime = new Date().toString();
            this.base64Image = 'data:image/jpeg;base64,' + imageData;
            this.save(this.base64Image, this.defaultFilenamePrefix);

            this.processor = new ImageProcessor(this.base64Image);
            this.updateImage();
          },
          err => {
            console.log('Error taking picture', err);
          }
        )
        .then()
        .catch(err => {
          console.log('error on catch', err);
        });
    } catch (e) {
      console.log('error', e);
    }
  }

  updateImage() {
    this.info('Updating image');

    this.processor.mask(this.current, this.threshold).then(base64 => {
      this.base64Image = base64;
    });
  }

  saveUpdated() {
    if (this.processor) {
      const filenamePrefix =
        'glassCamera_' + this.current.toHex() + '_T' + this.threshold + '_';
      this.save(this.base64Image, filenamePrefix);
    }
  }

  save(base64: string, filenamePrefix: string) {
    this.base64ToGallery
      .base64ToGallery(base64, {
        mediaScanner: true,
        prefix: filenamePrefix
      })
      .then(
        res => {
          this.info('Image saved to the gallery');
          console.log('Saved image to gallery ', res);
        },
        err => {
          this.info('Error saving image to gallery');
          console.log('Error saving image to gallery ', err);
        }
      );
  }

  thesholdChanged() {
    if (this.processor) {
      this.updateImage();
    }
  }

  info(message: string) {
    this.toast
      .create({
        message: message,
        duration: 1000,
        position: 'top'
      })
      .present();
  }
}
