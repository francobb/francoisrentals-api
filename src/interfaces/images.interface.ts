export interface Image extends Document {
  uri: string;
  name: string;
  type: string;
}

export interface ImagePath extends Document {
  path: string;
}
