public async captureImage() {
    const image: any = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 90,
    });

    const base64Data: string = image.base64String;
    const fileName: string = `IMG_${Date.now()}.${image.format}`;

    const blob = await this.base64toBlob(base64Data, image.format);

    const file = new File([blob], fileName, {
      type: `image/${image.format}`,
    });

    console.log(file);

    const hash = await this.calculateSHA256(file);

    const newImage: Image = {
      imageData: file,
      hash: hash,
      size: file.size,
      type: image.format,
      name: fileName,
    };

    this.images.push(newImage);
  }

  base64toBlob(base64Data: string, contentType: string) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }


 private async calculateSHA256(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const cryptoObj = crypto.subtle;
          const hashBuffer = await cryptoObj.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = (event) => {
        reject(event.target?.error);
      };

      fileReader.readAsArrayBuffer(file);
    });
  }
