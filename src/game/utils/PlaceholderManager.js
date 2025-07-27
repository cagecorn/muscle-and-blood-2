class PlaceholderManager {
  constructor() {
    this.placeholderPath = 'assets/images/placeholder.png';
  }

  setBackgroundImage(element, path) {
    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url(${path})`;
    };
    img.onerror = () => {
      element.style.backgroundImage = `url(${this.placeholderPath})`;
    };
    img.src = path;
  }

  setImageSrc(element, path) {
    const img = new Image();
    img.onload = () => {
      element.src = path;
    };
    img.onerror = () => {
      element.src = this.placeholderPath;
    };
    img.src = path;
  }
}

export const placeholderManager = new PlaceholderManager();
