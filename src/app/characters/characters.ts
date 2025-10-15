import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Characters {
  private readonly characters = [
    { src: '/odlaw.jpg', alt: 'An illustration of Odlaw.' },
    { src: '/waldo.jpg', alt: 'An illustration of Waldo.' },
    { src: '/wilma.jpg', alt: 'An illustration of Wilma.' },
    { src: '/wizard.jpg', alt: 'An illustration of Wizard Whitebeard.' },
  ];

  get data() {
    return this.characters.map((c) => JSON.parse(JSON.stringify(c)));
  }
}
