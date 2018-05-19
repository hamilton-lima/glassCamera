export class ImageMaskColor {
  red: number;
  green: number;
  blue: number;

  constructor(color: string) {
    if (color.length < 7) {
      throw new Error("Invalid color: " + color);
    }

    this.red = Number.parseInt(color.substr(1, 2), 16);
    this.green = Number.parseInt(color.substr(3, 2), 16);
    this.blue = Number.parseInt(color.substr(5, 2), 16);
  }

  static build(red: number, green: number, blue: number) {
    const color =
      "#" +
      ImageMaskColor.hexColour(red) +
      ImageMaskColor.hexColour(green) +
      ImageMaskColor.hexColour(blue);

    return new ImageMaskColor(color);
  }

  toHex() {
    return (
      "#" +
      ImageMaskColor.hexColour(this.red) +
      ImageMaskColor.hexColour(this.green) +
      ImageMaskColor.hexColour(this.blue)
    );
  }

  static hexColour(c) {
    const s = Math.abs(c)
      .toString(16)
      .toUpperCase();

    if (s.length < 2) {
      return "0" + s;
    } else {
      return s;
    }
  }
}

export class ImageProcessor {
  private canvas: Promise<HTMLCanvasElement>;

  constructor(base64Image: string) {
    this.canvas = this.buildCanvas(base64Image);
  }

  getImageData(): Promise<ImageData> {
    return this.canvas.then(canvas => {
      const context = canvas.getContext("2d");
      return context.getImageData(0, 0, canvas.width, canvas.height);
    });
  }

  mask(mask: ImageMaskColor, threshold: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getImageData()
        .then(imageData => {
          console.log("mask()", JSON.stringify(mask), threshold);
          let closePixelsCount = 0;
          let counter = 0;

          for (let index = 0; index < imageData.data.length; index += 4) {
            let red = imageData.data[index];
            let green = imageData.data[index + 1];
            let blue = imageData.data[index + 2];

            // let alpha = imageData.data[index + 3];
            let current = ImageMaskColor.build(red, green, blue);
            const distance = this.colorDistance(mask, current);

            if (counter < 10) {
              console.log(
                "(1) current() / distance",
                JSON.stringify(current),
                distance
              );
            }

            counter++;
            if (distance < threshold) {
              closePixelsCount++;
              this.paint(index, imageData.data, 0);
            } else {
              this.paint(index, imageData.data, 255);
            }
          }
          console.log("closePixelsCount / counter", closePixelsCount, counter);
          return imageData;
        })
        .then(updatedImageData => {
          const canvas = document.createElement("canvas");
          canvas.width = updatedImageData.width;
          canvas.height = updatedImageData.height;
          const context = canvas.getContext("2d");
          context.putImageData(updatedImageData, 0, 0);
          resolve(canvas.toDataURL());
        });
    });
  }

  colorDistance(first: ImageMaskColor, second: ImageMaskColor): number {
    const red = first.red - second.red;
    const green = first.green - second.green;
    const blue = first.blue - second.blue;
    const d = red * red + green * green + blue * blue;

    return Math.sqrt(d);
  }

  paint(index, data: any, amount): any {
    data[index] = amount;
    data[index + 1] = amount;
    data[index + 2] = amount;
    data[index + 3] = 255;
  }

  buildCanvas(base64Image: string): Promise<HTMLCanvasElement> {
    console.log("build canvas");

    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        resolve(canvas);
      };
      image.src = base64Image;
    });
  }
}
