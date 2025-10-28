export interface Image {
  src: string;
  alt: string;
}

export interface Character {
  name: 'odlaw' | 'waldo' | 'wilma' | 'wizard';
  image: Image;
}
