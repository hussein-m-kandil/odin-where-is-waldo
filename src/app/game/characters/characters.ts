import { Injectable } from '@angular/core';
import { Character } from './characters.types';

@Injectable({
  providedIn: 'root',
})
export class Characters {
  private readonly characters: Character[] = [
    { name: 'odlaw', image: { src: '/odlaw.jpg', alt: 'An illustration of Odlaw.' } },
    { name: 'waldo', image: { src: '/waldo.jpg', alt: 'An illustration of Waldo.' } },
    { name: 'wilma', image: { src: '/wilma.jpg', alt: 'An illustration of Wilma.' } },
    { name: 'wizard', image: { src: '/wizard.jpg', alt: 'An illustration of Wizard Whitebeard.' } },
  ];

  get data() {
    return this.characters.map<Character>((c) => JSON.parse(JSON.stringify(c)));
  }
}
